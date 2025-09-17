package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI_export ./e2e/...

func TestInternalAPI_export(t *testing.T) {
	e := Server(t, fullSeeder)
	GRPCServer(t, fullSeeder)

	testWorkspace := wID.String()

	var publicProjectId string
	var privateProjectId string

	// call api by User1
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public
		res, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})
		require.Nil(t, err)
		require.NotNil(t, res.GetProject())
		publicProjectId = res.GetProject().Id

		// create private
		res, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("private"),
		})
		require.Nil(t, err)
		require.NotNil(t, res.GetProject())
		privateProjectId = res.GetProject().Id

		// private => OK
		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: publicProjectId,
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

	// call api Visitor
	runTestVisitor(t, func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// public => OK
		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: publicProjectId,
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

		// private => Error!
		exp, err = client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: privateProjectId,
		})

		assert.Nil(t, exp)
		assert.NotNil(t, err)

	})

	// call api by User2 (no member)
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// private => Error!
		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: privateProjectId,
		})

		assert.Nil(t, exp)
		assert.NotNil(t, err)

	})

	// call api by User3(member)
	runTestWithUser(t, uID3.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// private => OK
		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: privateProjectId,
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
