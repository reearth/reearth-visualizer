package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/stretchr/testify/assert"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI_export ./e2e/...

func TestInternalAPI_export(t *testing.T) {
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

	GRPCServer(t, fullSeeder)

	// call api user1
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: projectId,
		})

		assert.NotNil(t, exp.ProjectDataPath)
		assert.Nil(t, err)

		// Try download
		resp := e.GET(exp.ProjectDataPath).
			Expect().
			Status(200)

		resp.Header("Content-Type").Contains("application/zip")
		body := resp.Body().Raw()
		assert.Greater(t, len(body), 0)

	})

	// call api user2
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: projectId,
		})

		assert.NotNil(t, exp.ProjectDataPath)
		assert.Nil(t, err)

		// Try download
		resp := e.GET(exp.ProjectDataPath).
			Expect().
			Status(200)

		resp.Header("Content-Type").Contains("application/zip")
		body := resp.Body().Raw()
		assert.Greater(t, len(body), 0)

	})
}
