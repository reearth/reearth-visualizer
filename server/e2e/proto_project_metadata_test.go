package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI_metadata_update ./e2e/...

func TestInternalAPI_metadata_update(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	// call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// create public Project
		projectID := createProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			},
		)

		t.Run("update with normal topics", func(t *testing.T) {
			res := UpdateProjectMetadata(
				t, ctx, r, client,
				&pb.UpdateProjectMetadataRequest{
					ProjectId: projectID.String(),
					Readme:    lo.ToPtr("test readme"),
					License:   lo.ToPtr("test license"),
					Topics:    &pb.Topics{Values: []string{"test topics"}},
				},
			)
			assert.Equal(t, "test readme", *res.Readme)
			assert.Equal(t, "test license", *res.License)
			assert.Equal(t, []string{"test topics"}, res.Topics)
		})

		t.Run("opics should be empty after deletion", func(t *testing.T) {
			res := UpdateProjectMetadata(
				t, ctx, r, client,
				&pb.UpdateProjectMetadataRequest{
					ProjectId: projectID.String(),
					Readme:    lo.ToPtr("test readme 2"),
					License:   lo.ToPtr("test license 2"),
					Topics:    &pb.Topics{Values: []string{""}},
				},
			)
			assert.Equal(t, "test readme 2", *res.Readme)
			assert.Equal(t, "test license 2", *res.License)
			assert.Empty(t, res.Topics)
		})

		t.Run("update with nil topics", func(t *testing.T) {
			res := UpdateProjectMetadata(
				t, ctx, r, client,
				&pb.UpdateProjectMetadataRequest{
					ProjectId: projectID.String(),
					Readme:    lo.ToPtr("test readme 3"),
					License:   lo.ToPtr("test license 3"),
				},
			)
			assert.Equal(t, "test readme 3", *res.Readme)
			assert.Equal(t, "test license 3", *res.License)
			assert.Nil(t, res.Topics)
		})

		t.Run("update with multiple topics", func(t *testing.T) {
			res := UpdateProjectMetadata(
				t, ctx, r, client,
				&pb.UpdateProjectMetadataRequest{
					ProjectId: projectID.String(),
					Readme:    lo.ToPtr("test readme 4"),
					License:   lo.ToPtr("test license 4"),
					Topics:    &pb.Topics{Values: []string{"topic1", "topic2", "topic3"}},
				},
			)
			assert.Equal(t, "test readme 4", *res.Readme)
			assert.Equal(t, "test license 4", *res.License)
			assert.Equal(t, []string{"topic1", "topic2", "topic3"}, res.Topics)
		})
	})
}

func UpdateProjectMetadata(t *testing.T, ctx context.Context, r *repo.Container, client pb.ReEarthVisualizerClient, req *pb.UpdateProjectMetadataRequest) *pb.ProjectMetadata {
	// test UpdateProject
	res, err := client.UpdateProjectMetadata(ctx, req)
	require.Nil(t, err)
	require.NotNil(t, res.GetMetadata())
	return res.GetMetadata()
}
