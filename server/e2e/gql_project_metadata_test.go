package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearthx/account/accountdomain"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCreateAndGetProjectMetadata ./e2e/...

func TestCreateAndGetProjectMetadata(t *testing.T) {
	e := Server(t, baseSeeder)

	projectID := createProject(e, uID, map[string]any{
		"name":        "project1-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	updateProjectMetadata(e, uID, map[string]any{
		"input": map[string]any{
			"project": projectID,
			"readme":  "readme test",
			"license": "license test",
			"topics":  "topics test",
		},
	})

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"workspaceId": wID.String(),
			"pagination": map[string]any{
				"first": 16,
			},
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
		},
	}

	res := Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges[0].node.metadata").Object()

	res.Value("readme").String().IsEqual("readme test")
	res.Value("license").String().IsEqual("license test")
	res.Value("topics").String().IsEqual("topics test")
}

const UpdateProjectMetadataMutation = `
mutation UpdateProjectMetadata($input: UpdateProjectMetadataInput!) {
  updateProjectMetadata(input: $input) {
    metadata {
      id
      project
      workspace
      readme
      license
	  topics
      importStatus
      createdAt
      updatedAt
      __typename
	}
    __typename
  }
}
`

func updateProjectMetadata(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UpdateProjectMetadata",
		Query:         UpdateProjectMetadataMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.updateProjectMetadata.metadata")
}
