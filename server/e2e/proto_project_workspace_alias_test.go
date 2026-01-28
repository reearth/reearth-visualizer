//go:build e2e

package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// make e2e-test TEST_NAME=TestInternalAPI_ProjectWorkspaceAlias
func TestInternalAPI_ProjectWorkspaceAlias(t *testing.T) {
	_, _, _, result := GRPCServer(t, baseSeeder)

	runTestWithUser(t, result.UID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		projectAlias := "ws-project-alias"

		createRes, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId:  result.WID.String(),
			Visualizer:   pb.Visualizer_VISUALIZER_CESIUM,
			Name:         lo.ToPtr("Workspace Alias Project"),
			Description:  lo.ToPtr("Workspace Alias Project Description"),
			CoreSupport:  lo.ToPtr(true),
			Visibility:   lo.ToPtr("public"),
			ProjectAlias: lo.ToPtr(projectAlias),
		})
		require.NoError(t, err)

		created := createRes.GetProject()

		getRes, err := client.GetProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: result.WAlias,
			ProjectAlias:   projectAlias,
		})
		require.NoError(t, err)
		assert.Equal(t, created.Id, getRes.Project.Id)

		updatedAlias := "ws-project-alias-updated"
		updatedName := "Workspace Alias Project Updated"
		updateRes, err := client.UpdateProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.UpdateProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias:  result.WAlias,
			ProjectAlias:    projectAlias,
			Name:            lo.ToPtr(updatedName),
			NewProjectAlias: lo.ToPtr(updatedAlias),
		})
		require.NoError(t, err)
		assert.Equal(t, updatedAlias, updateRes.Project.ProjectAlias)
		assert.Equal(t, updatedName, updateRes.Project.Name)

		delRes, err := client.DeleteProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.DeleteProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: result.WAlias,
			ProjectAlias:   updatedAlias,
		})
		require.NoError(t, err)
		assert.Equal(t, updatedAlias, delRes.ProjectAlias)

		_, err = client.GetProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: result.WAlias,
			ProjectAlias:   updatedAlias,
		})
		require.Error(t, err)
	})
}
