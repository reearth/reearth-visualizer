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
	sce, hasScene := proj["scene"]
	require.True(t, hasProject, "`project` key must exist in project.json")
	require.True(t, hasScene, "`scene` key must exist in project.json")

	exportedInfo, hasExportedInfo := proj["exportedInfo"].(map[string]any)
	require.True(t, hasExportedInfo, "`exportedInfo` key must exist in project.json")

	_, hasWidgetAlignSystem := sce.(map[string]any)["widgetAlignSystem"]
	require.False(t, hasWidgetAlignSystem, "`widgetAlignSystem` key exist in project.json")

	_, hasWidgetAlignSystems := sce.(map[string]any)["widgetAlignSystems"]
	require.True(t, hasWidgetAlignSystems, "`widgetAlignSystems` key must exist in project.json")

	_, hasExportDataVersion := exportedInfo["exportDataVersion"]
	require.True(t, hasExportDataVersion, "`exportedInfo.exportDataVersion` key must exist in project.json")

}

func TestProjectExportDownloadAuth(t *testing.T) {
	e := Server(t, fullSeeder)

	// --- public project ---
	publicProjectId := SetupProject(t, e)
	publicPath := Export(t, e, publicProjectId)

	// public project: unauthenticated download allowed
	e.GET(publicPath).
		Expect().
		Status(http.StatusOK).
		Header("Content-Type").Contains("application/zip")

	// public project: authenticated download allowed
	publicPath2 := Export(t, e, publicProjectId)
	e.GET(publicPath2).
		WithHeader("Authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusOK).
		Header("Content-Type").Contains("application/zip")

	// --- private project ---
	privateProjectId := SetupProject(t, e)
	updateProject(e, uID, map[string]any{
		"input": map[string]any{
			"projectId":  privateProjectId,
			"visibility": "private",
		},
	})

	// private project: unauthenticated download blocked
	privatePath := Export(t, e, privateProjectId)
	e.GET(privatePath).
		Expect().
		Status(http.StatusUnauthorized)

	// private project: owner can download
	privatePath2 := Export(t, e, privateProjectId)
	e.GET(privatePath2).
		WithHeader("Authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusOK).
		Header("Content-Type").Contains("application/zip")

	// private project: workspace member (uID3) can download
	privatePath3 := Export(t, e, privateProjectId)
	e.GET(privatePath3).
		WithHeader("Authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID3.String()).
		Expect().
		Status(http.StatusOK).
		Header("Content-Type").Contains("application/zip")

	// private project: non-member (uID2, different workspace) blocked
	privatePath4 := Export(t, e, privateProjectId)
	e.GET(privatePath4).
		WithHeader("Authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID2.String()).
		Expect().
		Status(http.StatusUnauthorized)
}

func TestProjectExportDownloadNotFound(t *testing.T) {
	e := Server(t, fullSeeder)

	// non-existent project ID
	e.GET("/export/00000000000000000000000000.zip").
		Expect().
		Status(http.StatusNotFound)

	// project that exists but has never been exported (no GCS file)
	projectId := SetupProject(t, e)
	e.GET("/export/" + projectId + ".zip").
		Expect().
		Status(http.StatusNotFound)
}

func TestProjectExportDownloadDeletedProject(t *testing.T) {
	e := Server(t, fullSeeder)

	projectId := SetupProject(t, e)
	path := Export(t, e, projectId)

	// soft-delete the project
	deleteProject(e, projectId)

	// deleted project download should be blocked
	e.GET(path).
		WithHeader("Authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().
		Status(http.StatusUnauthorized)
}

func SetupProject(t *testing.T, e *httpexpect.Expect) string {
	projectId, sceneId, _ := createProjectSet(e)
	updateProjectMetadata(e, uID, map[string]any{
		"input": map[string]any{
			"project": projectId,
			"readme":  "readme test",
			"license": "license test",
			"topics":  []string{"gis", "history"},
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
