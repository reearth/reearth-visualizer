package e2e

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

const ExportProjectMutation = `
mutation ExportProject($projectId: ID!) {
  exportProject(input: { projectId: $projectId }) {
    projectDataPath
    __typename
  }
}`

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestProjectExport ./e2e/...

func TestProjectExport(t *testing.T) {
	e := Server(t, fullSeeder)

	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         ExportProjectMutation,
		Variables: map[string]any{
			"projectId": pID.String(),
		},
	}

	projectDataPath := Request(e, uID.String(), requestBody).
		Path("$.data.exportProject.projectDataPath").String()

	assert.NotNil(t, projectDataPath)

}
