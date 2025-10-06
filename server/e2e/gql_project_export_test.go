package e2e

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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

	projectId := SetupProject(t, e)
	projectDataPath := Export(t, e, projectId)

	resp := e.GET(projectDataPath).
		Expect().
		Status(200)

	resp.Header("Content-Type").Contains("application/zip")

	b := []byte(resp.Body().Raw())
	require.NotEmpty(t, b, "response body must not be empty")

	tmp := filepath.Join(t.TempDir(), "project.zip")
	require.NoError(t, os.WriteFile(tmp, b, 0o644))
	t.Cleanup(func() { _ = os.Remove(tmp) })
	t.Logf("saved: %s (%d bytes)", tmp, len(b))

	require.True(t, bytes.HasPrefix(b, []byte("PK\x03\x04")), "not a zip file?")

	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	require.NoError(t, err)
	require.Greater(t, len(zr.File), 0, "zip has no entries")

	var (
		foundProjectJSON bool
		projRaw          []byte
	)

	for _, f := range zr.File {
		if f.Name == "project.json" {
			foundProjectJSON = true
			rc, err := f.Open()
			require.NoError(t, err)
			projRaw, err = io.ReadAll(rc)
			rc.Close()
			require.NoError(t, err)
			break
		}
	}
	require.True(t, foundProjectJSON, "project.json must exist in the zip")
	require.NotEmpty(t, projRaw, "project.json must not be empty")

	var proj map[string]any
	require.NoError(t, json.Unmarshal(projRaw, &proj), "project.json must be valid JSON")

	_, hasProject := proj["project"]
	_, hasScene := proj["scene"]
	require.True(t, hasProject, "`project` key must exist in project.json")
	require.True(t, hasScene, "`scene` key must exist in project.json")
}

func SetupProject(t *testing.T, e *httpexpect.Expect) string {
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
	return projectId
}

func Export(t *testing.T, e *httpexpect.Expect, projectId string) string {

	projectDataPath := Request(e, uID.String(), GraphQLRequest{
		OperationName: "ExportProject",
		Query:         ExportProjectMutation,
		Variables: map[string]any{
			"projectId": projectId,
		},
	}).Path("$.data.exportProject.projectDataPath").String()

	assert.NotNil(t, projectDataPath)

	return projectDataPath.Raw()
}
