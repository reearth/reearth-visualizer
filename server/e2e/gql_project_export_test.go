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

	projectId, sceneId, _ := createProjectSet(e)
	updateProjectMetadata(e, uID, map[string]any{
		"input": map[string]any{
			"project": projectId,
			"readme":  "readme test",
			"license": "license test",
			"topics":  "topics test",
		},
	})
	_, _, layerId := addNLSLayerSimple(e, sceneId, "someTitle1", 1)
	createPhotoOverlay(e, layerId)

	projectDataPath := Request(e, uID.String(), GraphQLRequest{
		OperationName: "ExportProject",
		Query:         ExportProjectMutation,
		Variables: map[string]any{
			"projectId": projectId,
		},
	}).Path("$.data.exportProject.projectDataPath").String()

	assert.NotNil(t, projectDataPath)

	// Try download
	resp := e.GET(projectDataPath.Raw()).
		Expect().
		Status(200)

	resp.Header("Content-Type").Contains("application/zip")
	body := resp.Body().Raw()
	assert.Greater(t, len(body), 0)
}
