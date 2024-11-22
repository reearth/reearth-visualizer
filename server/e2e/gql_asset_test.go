package e2e

import (
	"net/http"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
)

func TestGetAssets(t *testing.T) {
	c := &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}
	e := StartServer(t, c, true, baseSeeder)

	teamId := wID.String()

	res := createAsset(t, e, "test.png", true, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		ValueEqual("teamId", teamId).
		ValueEqual("name", "test.png").
		ValueEqual("coreSupport", true)

	res = createAsset(t, e, "test.png", false, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		ValueEqual("teamId", teamId).
		ValueEqual("name", "test.png").
		ValueEqual("coreSupport", false)

	res = createAsset(t, e, "test.csv", true, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		ValueEqual("teamId", teamId).
		ValueEqual("name", "test.csv").
		ValueEqual("coreSupport", true)

	res = createAsset(t, e, "test.csv", false, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		ValueEqual("teamId", teamId).
		ValueEqual("name", "test.csv").
		ValueEqual("coreSupport", false)

	res = getAssets(e, teamId)
	assets := res.Object().Value("data").Object().Value("assets").Object().Value("nodes").Array().Iter()
	for _, a := range assets {
		a.Object().ValueEqual("coreSupport", true) // coreSupport true only
	}

}

const CreateAssetMutation = `mutation CreateAsset($teamId: ID!, $file: Upload!, $coreSupport: Boolean!) {
  createAsset(input: {teamId: $teamId, file: $file, coreSupport: $coreSupport}) {
    asset {
      id
      teamId
      name
      size
      url
      contentType
	  coreSupport
      __typename
    }
    __typename
  }
}`

func createAsset(t *testing.T, e *httpexpect.Expect, filePath string, coreSupport bool, teamId string) *httpexpect.Value {
	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open file: %v", err)
	}
	defer func() {
		if cerr := file.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()
	requestBody := map[string]interface{}{
		"operationName": "CreateAsset",
		"variables": map[string]interface{}{
			"teamId":      teamId,
			"coreSupport": coreSupport,
			"file":        nil,
		},
		"query": CreateAssetMutation,
	}
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithMultipart().
		WithFormField("operations", toJSONString(requestBody)).
		WithFormField("map", `{"0": ["variables.file"]}`).
		WithFile("0", filePath).
		Expect().
		Status(http.StatusOK).
		JSON()
}

const GetAssetsQuery = `query GetAssets($teamId: ID!, $pagination: Pagination, $keyword: String, $sort: AssetSort) {
	assets(teamId: $teamId, pagination: $pagination, keyword: $keyword, sort: $sort) {
	  edges {
		cursor
		node {
		  id
		  teamId
		  name
		  size
		  url
		  createdAt
		  contentType
		  coreSupport
		  __typename
		}
		__typename
	  }
	  nodes {
		id
		teamId
		name
		size
		url
		createdAt
		contentType
		coreSupport
		__typename
	  }
	  pageInfo {
		endCursor
		hasNextPage
		hasPreviousPage
		startCursor
		__typename
	  }
	  totalCount
	  __typename
	}
  }`

func getAssets(e *httpexpect.Expect, teamId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetAssets",
		Query:         GetAssetsQuery,
		Variables: map[string]any{
			"teamId": teamId,
			"pagination": map[string]any{
				"first": 20,
			},
			"sort": map[string]string{
				"direction": "DESC",
				"field":     "DATE",
			},
		},
	}
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
}
