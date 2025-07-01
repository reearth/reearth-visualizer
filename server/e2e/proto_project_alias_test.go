package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/require"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI_alias ./e2e/...

func TestInternalAPI_alias(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	// create public Project
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		//-------------------------------------
		// create public Project1
		//-------------------------------------
		res1, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId: wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})
		require.Nil(t, err)

		pj1 := res1.GetProject()

		// allow case
		//----------------------------
		allowRes, err := client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj1.Id,
			Alias:     pj1.SceneId, // self SceneId => OK
		})
		require.Nil(t, err)
		require.Equal(t, allowRes.Available, true)

		allowRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj1.Id,
			Alias:     res1.Project.Alias, // self Alias => OK
		})
		require.Nil(t, err)
		require.Equal(t, allowRes.Available, true)

		allowRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj1.Id,
			Alias:     "xxxxxxxxxx", // uniq Alias => OK
		})
		require.Nil(t, err)
		require.Equal(t, allowRes.Available, true)

		// forbidden case
		//----------------------------
		forbiddenRes, err := client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj1.Id,
			Alias:     "c-xxxxxxx", // NG
		})
		require.Nil(t, err)
		require.Equal(t, forbiddenRes.Available, false)

		forbiddenRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj1.Id,
			Alias:     "s-xxxxxxx", // NG
		})
		require.Nil(t, err)
		require.Equal(t, forbiddenRes.Available, false)

		// forbidden case (anonymous)
		//----------------------------
		forbiddenRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: nil,
			Alias:     pj1.SceneId, // NG
		})
		require.Nil(t, err)
		require.Equal(t, forbiddenRes.Available, false)

		//-------------------------------------
		// create public Project2
		//-------------------------------------
		res2, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId: wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})

		require.Nil(t, err)

		pj2 := res2.GetProject()

		// forbidden case
		//----------------------------
		forbiddenRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj2.Id,
			Alias:     pj1.SceneId, // NG
		})
		require.Nil(t, err)
		require.Equal(t, forbiddenRes.Available, false)

		forbiddenRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj2.Id,
			Alias:     res1.Project.Alias, // NG
		})
		require.Nil(t, err)
		require.Equal(t, forbiddenRes.Available, false)

		//-------------------------------------
		// update project1 Alias
		//-------------------------------------
		pid1, err := id.ProjectIDFrom(pj1.Id)
		require.Nil(t, err)
		pj, err := r.Project.FindByID(ctx, pid1)
		require.Nil(t, err)
		pj.UpdateAlias("xxxxxxxxxx")
		err = r.Project.Save(ctx, pj)
		require.Nil(t, err)
		pj, err = r.Project.FindByID(ctx, pid1)
		require.Nil(t, err)
		require.Equal(t, "xxxxxxxxxx", pj.Alias())

		allowRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj1.Id,
			Alias:     "xxxxxxxxxx", // project1 xxxxxxxxxx => OK
		})
		require.Nil(t, err)
		require.Equal(t, allowRes.Available, true)

		forbiddenRes, err = client.ValidateProjectAlias(ctx, &pb.ValidateProjectAliasRequest{
			ProjectId: &pj2.Id,
			Alias:     "xxxxxxxxxx", // project2 xxxxxxxxxx => NG
		})
		require.Nil(t, err)
		require.Equal(t, forbiddenRes.Available, false)

	})
}
