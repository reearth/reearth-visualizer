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
// go test -v -run TestInternalAPI_ProjectWorkspaceAlias ./e2e/...
func TestInternalAPI_ProjectWorkspaceAlias(t *testing.T) {
	GRPCServer(t, baseSeeder)

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		projectAlias := "ws-project-alias"

		createRes, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId:  wID.String(),
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
			WorkspaceAlias: wAlias,
			ProjectAlias:   projectAlias,
		})
		require.NoError(t, err)
		assert.Equal(t, created.Id, getRes.Project.Id)

		updatedAlias := "ws-project-alias-updated"
		updatedName := "Workspace Alias Project Updated"
		updateRes, err := client.UpdateProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.UpdateProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias:  wAlias,
			ProjectAlias:    projectAlias,
			Name:            lo.ToPtr(updatedName),
			NewProjectAlias: lo.ToPtr(updatedAlias),
		})
		require.NoError(t, err)
		assert.Equal(t, updatedAlias, updateRes.Project.ProjectAlias)
		assert.Equal(t, updatedName, updateRes.Project.Name)

		delRes, err := client.DeleteProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.DeleteProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: wAlias,
			ProjectAlias:   updatedAlias,
		})
		require.NoError(t, err)
		assert.Equal(t, updatedAlias, delRes.ProjectAlias)

		_, err = client.GetProjectByWorkspaceAliasAndProjectAlias(ctx, &pb.GetProjectByWorkspaceAliasAndProjectAliasRequest{
			WorkspaceAlias: wAlias,
			ProjectAlias:   updatedAlias,
		})
		require.Error(t, err)
	})
}
