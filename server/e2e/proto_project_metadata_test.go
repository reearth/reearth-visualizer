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

		// update metadata
		res := UpdateProjectMetadata(
			t, ctx, r, client,
			&pb.UpdateProjectMetadataRequest{
				ProjectId: projectID.String(),
				Readme:    lo.ToPtr("test readme"),
				License:   lo.ToPtr("test license"),
				Topics:    []string{"test topics"},
			},
		)
		assert.Equal(t, "test readme", *res.Readme)
		assert.Equal(t, "test license", *res.License)
		assert.Equal(t, []string{"test topics"}, res.Topics)
	})
}

func UpdateProjectMetadata(t *testing.T, ctx context.Context, r *repo.Container, client pb.ReEarthVisualizerClient, req *pb.UpdateProjectMetadataRequest) *pb.ProjectMetadata {
	// test UpdateProject
	res, err := client.UpdateProjectMetadata(ctx, req)
	require.Nil(t, err)
	require.NotNil(t, res.GetMetadata())
	return res.GetMetadata()
}
