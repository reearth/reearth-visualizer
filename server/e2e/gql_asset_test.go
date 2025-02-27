package e2e

import (
	"context"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestCoreSupportGetAssets ./e2e/...

func TestCoreSupportGetAssets(t *testing.T) {
	e, r, _ := ServerAndRepos(t, baseSeeder)

	teamId := wID.String()

	res := createAsset(t, e, "test.png", true, teamId, nil)
	a := res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": true,
		"id": ".*",
		"name": "test.png",
		"projectId": null,
		"size": 30438,
		"teamId": ".*",
		"url": ".*"
	}`)

	res = createAsset(t, e, "test.png", false, teamId, nil)
	a = res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": false,
		"id": ".*",
		"name": "test.png",
		"projectId": null,
		"size": 30438,
		"teamId": ".*",
		"url": ".*"
	}`)

	res = createAsset(t, e, "test.csv", true, teamId, nil)
	a = res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": true,
		"id": ".*",
		"name": "test.csv",
		"projectId": null,
		"size": 231,
		"teamId": ".*",
		"url": ".*"
	}`)

	res = createAsset(t, e, "test.csv", false, teamId, nil)
	a = res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": false,
		"id": ".*",
		"name": "test.csv",
		"projectId": null,
		"size": 231,
		"teamId": ".*",
		"url": ".*"
	}`)

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
	as, _, err := r.Asset.FindByWorkspaceProject(ctx, wID, nil, repo.AssetFilter{
		Pagination: usecasex.CursorPagination{
			First: &f,
		}.Wrap(),
	})
	assert.Nil(t, err)
	assert.Equal(t, len(as), 4)

	res = getAssets(e, teamId, nil)
	assets := res.Path("$.data.assets.nodes").Array().Iter()
	for _, a := range assets {
		a.Object().HasValue("coreSupport", true) // coreSupport true only
	}

}

// go test -v -run TestAssociateProjectGetAssets ./e2e/...

func TestAssociateProjectGetAssets(t *testing.T) {
	e, _, _ := ServerAndRepos(t, baseSeeder)
	teamId := wID.String()

	// Create projectA >>> test.png
	pidA := createProject(e, "projectA")
	createAsset(t, e, "test.png", true, teamId, &pidA)

	// Create projectB >>> test.csv
	pidB := createProject(e, "projectB")
	createAsset(t, e, "test.csv", true, teamId, &pidB)

	// Get projectA >>> test.png
	res := getAssets(e, teamId, &pidA)
	assets := res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(1)
	assets.Value(0).Object().HasValue("name", "test.png")

	// Get projectB >>> test.csv
	res = getAssets(e, teamId, &pidB)
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(1)
	assets.Value(0).Object().HasValue("name", "test.csv")

	// Get none project(Workspace) >>> test.png, test.csv
	res = getAssets(e, teamId, nil)
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(3)
	assets.Value(0).Object().HasValue("name", "test.csv")
	assets.Value(1).Object().HasValue("name", "test.png")

	assetId0 := assets.Value(0).Object().Value("id").Raw().(string)
	assetId1 := assets.Value(1).Object().Value("id").Raw().(string)

	// Move projectA(test.png) >>> projectB
	updateAsset(e, assetId1, &pidB)
	res = getAssets(e, teamId, &pidB)
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(2) // projectB  >>> test.png, test.csv

	// Remove projectID test
	updateAsset(e, assetId0, nil) // projectID > null
	updateAsset(e, assetId1, nil) // projectID > null

	res = getAssets(e, teamId, &pidB)
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(0) // projectB >>> none

	// Remove asset test
	removeAsset(e, assetId0)
	removeAsset(e, assetId1)

	res = getAssets(e, teamId, nil)
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(1)
}

const CreateAssetMutation = `mutation CreateAsset($teamId: ID!, $projectId: ID, $file: Upload!, $coreSupport: Boolean!) {
  createAsset(
    input: {teamId: $teamId, projectId: $projectId, file: $file, coreSupport: $coreSupport}
  ) {
    asset {
      id
      teamId
      projectId
      name
      size
      url
	  coreSupport
      contentType
      __typename
    }
    __typename
  }
}`

func createAsset(t *testing.T, e *httpexpect.Expect, filePath string, coreSupport bool, teamId string, projectId *string) *httpexpect.Value {
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
			"projectId":   projectId,
			"coreSupport": coreSupport,
			"file":        nil,
		},
		"query": CreateAssetMutation,
	}
	assert.Nil(t, err)
	return RequestWithMultipart(e, uID.String(), requestBody, filePath)
}

func updateAsset(e *httpexpect.Expect, assetId string, projectId *string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UpdateAsset",
		Query: `mutation UpdateAsset($assetId: ID!, $projectId: ID) {
			updateAsset(input: { assetId: $assetId projectId: $projectId }) {
				assetId
				projectId
				__typename
			}
		}`,
		Variables: map[string]any{
			"assetId":   assetId,
			"projectId": projectId,
		},
	}
	return Request(e, uID.String(), requestBody)
}

func removeAsset(e *httpexpect.Expect, assetId string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "RemoveAsset",
		Query: `mutation RemoveAsset($assetId: ID!) {
			removeAsset(input: { assetId: $assetId }) {
				assetId
				__typename
			}
		}`,
		Variables: map[string]any{
			"assetId": assetId,
		},
	}
	return Request(e, uID.String(), requestBody)
}

func createAssetFromFileData(t *testing.T, e *httpexpect.Expect, fileData []byte, coreSupport bool, teamId string, projectId *string) *httpexpect.Value {
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
			"projectId":   projectId,
			"coreSupport": coreSupport,
			"file":        nil,
		},
		"query": CreateAssetMutation,
	}
	return RequestWithMultipart(e, uID.String(), requestBody, tempFile.Name())
}

func getAssets(e *httpexpect.Expect, teamId string, projectId *string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetAssets",
		Query: `query GetAssets($teamId: ID!, $projectId: ID, $pagination: Pagination, $keyword: String, $sort: AssetSort) {
  assets(
    teamId: $teamId
    projectId: $projectId
    pagination: $pagination
    keyword: $keyword
    sort: $sort
  ) {
    edges {
      cursor
      node {
        id
        teamId
        projectId
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
      projectId
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
}`,
		Variables: map[string]any{
			"teamId":    teamId,
			"projectId": projectId,
			"pagination": map[string]any{
				"first": 20,
			},
			"sort": map[string]string{
				"direction": "DESC",
				"field":     "DATE",
			},
		},
	}
	return Request(e, uID.String(), requestBody)
}
