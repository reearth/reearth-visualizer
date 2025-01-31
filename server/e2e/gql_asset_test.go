package e2e

import (
	"context"
	"net/http"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestGetAssets ./e2e/...

func TestGetAssets(t *testing.T) {
	c := &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}
	e, r, _ := StartServerAndRepos(t, c, true, baseSeeder)

	teamId := wID.String()

	res := createAsset(t, e, "test.png", true, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		HasValue("teamId", teamId).
		HasValue("name", "test.png").
		HasValue("coreSupport", true)

	res = createAsset(t, e, "test.png", false, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		HasValue("teamId", teamId).
		HasValue("name", "test.png").
		HasValue("coreSupport", false)

	res = createAsset(t, e, "test.csv", true, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		HasValue("teamId", teamId).
		HasValue("name", "test.csv").
		HasValue("coreSupport", true)

	res = createAsset(t, e, "test.csv", false, teamId)
	res.Object().Value("data").Object().Value("createAsset").Object().Value("asset").Object().
		HasValue("teamId", teamId).
		HasValue("name", "test.csv").
		HasValue("coreSupport", false)

	// Write directly to the DB
	ctx := context.Background()
	a1, err := asset.New().
		NewID().Workspace(wID).Name("test.png").Size(30438).URL("https://example.com/xxxxxxxxxxxxxxxxxxxxxxxxxx.png").
		// CoreSupport(true). // not set CoreSupport
		Build()
	assert.Nil(t, err)
	err = r.Asset.Save(ctx, a1)
	assert.Nil(t, err)

	a2, err := asset.New().
		NewID().Workspace(wID).Name("test.png").Size(30438).URL("https://example.com/xxxxxxxxxxxxxxxxxxxxxxxxxx.png").
		CoreSupport(true). // CoreSupport true
		Build()
	assert.Nil(t, err)
	err = r.Asset.Save(ctx, a2)
	assert.Nil(t, err)

	a3, err := asset.New().
		NewID().Workspace(wID).Name("test.png").Size(30438).URL("https://example.com/xxxxxxxxxxxxxxxxxxxxxxxxxx.png").
		CoreSupport(false). // CoreSupport false
		Build()
	assert.Nil(t, err)
	err = r.Asset.Save(ctx, a3)
	assert.Nil(t, err)

	f := int64(20)
	as, _, err := r.Asset.FindByWorkspace(ctx, wID, repo.AssetFilter{
		Pagination: usecasex.CursorPagination{
			First: &f,
		}.Wrap(),
	})
	assert.Nil(t, err)
	assert.Equal(t, len(as), 3)

	res = getAssets(e, teamId)
	assets := res.Object().Value("data").Object().Value("assets").Object().Value("nodes").Array().Iter()
	for _, a := range assets {
		a.Object().HasValue("coreSupport", true) // coreSupport true only
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
	assert.Nil(t, err)
	return RequestWithMultipart(e, uID.String(), requestBody, filePath)
}

func createAssetFromFileData(t *testing.T, e *httpexpect.Expect, fileData []byte, coreSupport bool, teamId string) *httpexpect.Value {
	tempFile, err := os.CreateTemp("", "requestBody-*.json")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	if _, err := tempFile.Write(fileData); err != nil {
		t.Fatalf("failed to write to temp file: %v", err)
	}
	defer func() {
		if cerr := tempFile.Close(); cerr != nil && err == nil {
			err = cerr
		}
		if err := os.Remove(tempFile.Name()); err != nil {
			t.Logf("failed to remove temp file: %v", err)
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
	return RequestWithMultipart(e, uID.String(), requestBody, tempFile.Name())
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
