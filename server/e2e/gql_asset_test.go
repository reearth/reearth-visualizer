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
	e, r, _, result := ServerAndRepos(t, baseSeeder)

	workspaceId := result.WID.String()

	res := createAsset(t, e, "test.png", true, workspaceId, nil, result.UID.String())
	a := res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": true,
		"id": ".*",
		"name": "test.png",
		"projectId": null,
		"size": 30438,
		"workspaceId": ".*",
		"url": ".*"
	}`)

	res = createAsset(t, e, "test.png", false, workspaceId, nil, result.UID.String())
	a = res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": false,
		"id": ".*",
		"name": "test.png",
		"projectId": null,
		"size": 30438,
		"workspaceId": ".*",
		"url": ".*"
	}`)

	res = createAsset(t, e, "test.csv", true, workspaceId, nil, result.UID.String())
	a = res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": true,
		"id": ".*",
		"name": "test.csv",
		"projectId": null,
		"size": 231,
		"workspaceId": ".*",
		"url": ".*"
	}`)

	res = createAsset(t, e, "test.csv", false, workspaceId, nil, result.UID.String())
	a = res.Path("$.data.createAsset.asset")
	JSONEqRegexpValue(t, a, `{
		"__typename": "Asset",
		"contentType": "",
		"coreSupport": false,
		"id": ".*",
		"name": "test.csv",
		"projectId": null,
		"size": 231,
		"workspaceId": ".*",
		"url": ".*"
	}`)

	// Write directly to the DB

	ctx := context.Background()
	a1, err := asset.New().
		NewID().Workspace(result.WID).Name("test.png").Size(30438).URL("https://example.com/xxxxxxxxxxxxxxxxxxxxxxxxxx.png").
		// CoreSupport(true). // not set CoreSupport
		Build()
	assert.Nil(t, err)
	err = r.Asset.Save(ctx, a1)
	assert.Nil(t, err)

	a2, err := asset.New().
		NewID().Workspace(result.WID).Name("test.png").Size(30438).URL("https://example.com/xxxxxxxxxxxxxxxxxxxxxxxxxx.png").
		CoreSupport(true). // CoreSupport true
		Build()
	assert.Nil(t, err)
	err = r.Asset.Save(ctx, a2)
	assert.Nil(t, err)

	a3, err := asset.New().
		NewID().Workspace(result.WID).Name("test.png").Size(30438).URL("https://example.com/xxxxxxxxxxxxxxxxxxxxxxxxxx.png").
		CoreSupport(false). // CoreSupport false
		Build()
	assert.Nil(t, err)
	err = r.Asset.Save(ctx, a3)
	assert.Nil(t, err)

	f := int64(20)
	as, _, err := r.Asset.FindByWorkspaceProject(ctx, result.WID, nil, repo.AssetFilter{
		Pagination: usecasex.CursorPagination{
			First: &f,
		}.Wrap(),
	})
	assert.Nil(t, err)
	assert.Equal(t, len(as), 5)

	res = getAssets(e, workspaceId, nil, result.UID.String())
	assets := res.Path("$.data.assets.nodes").Array().Iter()
	for _, a := range assets {
		a.Object().HasValue("coreSupport", true) // coreSupport true only
	}

}

// go test -v -run TestAssociateProjectGetAssets ./e2e/...

func TestAssociateProjectGetAssets(t *testing.T) {
	e, _, _, result := ServerAndRepos(t, baseSeeder)
	workspaceId := result.WID.String()

	// Create projectA >>> test.png
	pidA := createProject(e, result.UID, map[string]any{
		"name":        "projectA",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	res := createAsset(t, e, "test.png", true, workspaceId, &pidA, result.UID.String())
	res.Path("$.data.createAsset.asset.workspaceId").IsEqual(result.WID.String())
	res.Path("$.data.createAsset.asset.projectId").IsEqual(pidA)

	// Create projectB >>> test.csv
	pidB := createProject(e, result.UID, map[string]any{
		"name":        "projectB",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	res = createAsset(t, e, "test.csv", true, workspaceId, &pidB, result.UID.String())
	res.Path("$.data.createAsset.asset.workspaceId").IsEqual(result.WID.String())
	res.Path("$.data.createAsset.asset.projectId").IsEqual(pidB)

	// Get projectA >>> test.png
	res = getAssets(e, workspaceId, &pidA, result.UID.String())
	assets := res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(1)
	assets.Value(0).Object().HasValue("projectId", pidA)
	assets.Value(0).Object().HasValue("name", "test.png")

	// Get projectB >>> test.csv
	res = getAssets(e, workspaceId, &pidB, result.UID.String())
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(1)
	assets.Value(0).Object().HasValue("projectId", pidB)
	assets.Value(0).Object().HasValue("name", "test.csv")

	// Get none project(Workspace) >>> test.png, test.csv
	res = getAssets(e, workspaceId, nil, result.UID.String())
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(4)
	assets.Value(0).Object().HasValue("name", "test.csv")
	assets.Value(1).Object().HasValue("name", "test.png")

	assetId0 := assets.Value(0).Object().Value("id").Raw().(string)
	assetId1 := assets.Value(1).Object().Value("id").Raw().(string)

	// Move projectA(test.png) >>> projectB
	updateAsset(e, assetId1, &pidB, result.UID.String())
	res = getAssets(e, workspaceId, &pidB, result.UID.String())
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(2) // projectB  >>> test.png, test.csv

	// Remove projectID test
	updateAsset(e, assetId0, nil, result.UID.String()) // projectID > null
	updateAsset(e, assetId1, nil, result.UID.String()) // projectID > null

	res = getAssets(e, workspaceId, &pidB, result.UID.String())
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(0) // projectB >>> none

	// Remove asset test
	removeAsset(e, assetId0, result.UID.String())
	removeAsset(e, assetId1, result.UID.String())

	res = getAssets(e, workspaceId, nil, result.UID.String())
	assets = res.Path("$.data.assets.nodes").Array()
	assets.Length().IsEqual(2)
}

const CreateAssetMutation = `mutation CreateAsset($workspaceId: ID!, $projectId: ID, $file: Upload!, $coreSupport: Boolean!) {
  createAsset(
    input: {workspaceId: $workspaceId, projectId: $projectId, file: $file, coreSupport: $coreSupport}
  ) {
    asset {
      id
      workspaceId
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

func createAsset(t *testing.T, e *httpexpect.Expect, filePath string, coreSupport bool, workspaceId string, projectId *string, userID string) *httpexpect.Value {
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
			"workspaceId": workspaceId,
			"projectId":   projectId,
			"coreSupport": coreSupport,
			"file":        nil,
		},
		"query": CreateAssetMutation,
	}
	assert.Nil(t, err)
	return RequestWithMultipart(e, userID, requestBody, filePath)
}

func updateAsset(e *httpexpect.Expect, assetId string, projectId *string, userID string) *httpexpect.Value {
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
	return Request(e, userID, requestBody)
}

func removeAsset(e *httpexpect.Expect, assetId string, userID string) *httpexpect.Value {
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
	return Request(e, userID, requestBody)
}

func getAssets(e *httpexpect.Expect, workspaceId string, projectId *string, userID string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetAssets",
		Query: `query GetAssets($workspaceId: ID!, $projectId: ID, $pagination: Pagination, $keyword: String, $sort: AssetSort) {
  assets(
    workspaceId: $workspaceId
    projectId: $projectId
    pagination: $pagination
    keyword: $keyword
    sort: $sort
  ) {
    edges {
      cursor
      node {
        id
        workspaceId
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
      workspaceId
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
			"workspaceId": workspaceId,
			"projectId":   projectId,
			"pagination": map[string]any{
				"first": 20,
			},
			"sort": map[string]string{
				"direction": "DESC",
				"field":     "DATE",
			},
		},
	}
	return Request(e, userID, requestBody)
}
