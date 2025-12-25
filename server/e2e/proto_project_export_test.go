//go:build e2e

package e2e

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// make e2e-test TEST_NAME=TestInternalAPI_export
func TestInternalAPI_export(t *testing.T) {
	t.Skip("Skipping TestInternalAPI_export - gRPC CreateProject returns status error with reearth-accounts integration")

	e, result := Server(t, fullSeeder)
	_, _, _, _ = GRPCServer(t, fullSeeder)

	testWorkspace := result.WID.String()

	var publicProjectId string
	var privateProjectId string

	// call api by User1
	runTestWithUser(t, result.UID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

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
		assert.Greater(t, len(body), 4)
		assert.Equal(t, "PK\x03\x04", string(body[:4])) // check zip file hedder

		// private => Error!
		exp, err = client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: privateProjectId,
		})

		assert.Nil(t, exp)
		assert.NotNil(t, err)

	})

	// call api by User2 (no member)
	runTestWithUser(t, result.UID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// private => Error!
		exp, err := client.ExportProject(ctx, &pb.ExportProjectRequest{
			ProjectId: privateProjectId,
		})

		assert.Nil(t, exp)
		assert.NotNil(t, err)

	})

	// call api by User3(member)
	runTestWithUser(t, result.UID3.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

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
		assert.Greater(t, len(body), 4)
		assert.Equal(t, "PK\x03\x04", string(body[:4])) // zip header

		data := []byte(body)

		r, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
		require.NoError(t, err)

		var pjBytes []byte
		for _, f := range r.File {
			if f.Name == "project.json" {
				rc, err := f.Open()
				require.NoError(t, err)

				var buf bytes.Buffer
				_, err = buf.ReadFrom(rc)
				rc.Close()
				require.NoError(t, err)

				pjBytes = buf.Bytes()
				break
			}
		}
		require.NotNil(t, pjBytes, "project.json should exist in the zip")
		assert.True(t, json.Valid(pjBytes), "project.json must be valid JSON")

		var doc map[string]any
		require.NoError(t, json.Unmarshal(pjBytes, &doc))

		_, ok := doc["project"].(map[string]any)
		assert.True(t, ok, "`project` must exist and be an object")

		_, ok = doc["scene"].(map[string]any)
		assert.True(t, ok, "`scene` must exist and be an object")

	})
}
