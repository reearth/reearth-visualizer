package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearthx/account/accountdomain"
)

const UpdateProjectMetadataMutation = `
mutation UpdateProjectMetadata($input: UpdateProjectMetadataInput!) {
  updateProjectMetadata(input: $input) {
    metadata {
      id
      project
      workspace
      readme
      license
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
	// RequestDump(requestBody)
	res := Request(e, u.String(), requestBody)
	// ValueDump(res)
	return res.Path("$.data.updateProjectMetadata.metadata")
}

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCreateAndGetProjectMetadata ./e2e/...

func TestCreateAndGetProjectMetadata(t *testing.T) {
	e := Server(t, baseSeeder)

	projectID := createProject(e, uID, map[string]any{
		"name":        "project1-test",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	// response :=
	updateProjectMetadata(e, uID, map[string]any{
		"input": map[string]any{
			"project": projectID,
			"readme":  "readme test",
			"license": "license test",
		},
	})

	// ValueDump(response)
	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"teamId": wID.String(),
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

}
