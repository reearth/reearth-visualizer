package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInternalAPI_alias(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

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

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI_publish ./e2e/...

func TestInternalAPI_publish(t *testing.T) {
	GRPCServer(t, baseSeeder)

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
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

		res2, err := client.PublishProject(ctx, &pb.PublishProjectRequest{
			ProjectId:         pj1.Id,
			Alias:             nil,
			PublishmentStatus: pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC,
		})
		require.Nil(t, err)
		assert.Equal(t, pb.PublishmentStatus_PUBLISHMENT_STATUS_UNSPECIFIED, res2.Project.PublishmentStatus)

		testAlias := "xxxxxxxxx"

		res3, err := client.PublishProject(ctx, &pb.PublishProjectRequest{
			ProjectId:         pj1.Id,
			Alias:             &testAlias,
			PublishmentStatus: pb.PublishmentStatus_PUBLISHMENT_STATUS_PUBLIC,
		})
		require.Nil(t, err)
		assert.Equal(t, testAlias, res3.Project.Alias)

	})
}

// go test -v -run TestInternalAPI_ProjectAlias_CRUD ./e2e/...

func TestInternalAPI_ProjectAlias_CRUD(t *testing.T) {
	GRPCServer(t, baseSeeder)

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
		res, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId: wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})
		require.Nil(t, err)

		pj := res.GetProject()
		projectAlias := pj.GetProjectAlias()

		res2, err := client.GetProjectByProjectAlias(ctx, &pb.GetProjectByProjectAliasRequest{
			ProjectAlias: projectAlias,
		})
		require.Nil(t, err)
		require.NotNil(t, res2)

		newName := "test-new-name"
		newProjectAlias := "test-new-projectalias"

		res3, err := client.UpdateByProjectAlias(ctx, &pb.UpdateByProjectAliasRequest{
			ProjectAlias:    projectAlias,
			Name:            lo.ToPtr(newName),
			NewProjectAlias: lo.ToPtr(newProjectAlias),
		})
		require.Nil(t, err)
		require.NotNil(t, res3)

		res4, err := client.GetProjectByProjectAlias(ctx, &pb.GetProjectByProjectAliasRequest{
			ProjectAlias: newProjectAlias,
		})
		require.Nil(t, err)
		require.NotNil(t, res4)

		pj = res4.GetProject()
		require.Equal(t, newName, pj.GetName())

		res5, err := client.DeleteByProjectAlias(ctx, &pb.DeleteByProjectAliasRequest{
			ProjectAlias: newProjectAlias,
		})
		require.Nil(t, err)
		require.Equal(t, newProjectAlias, res5.GetProjectAlias())

		res6, err := client.GetProjectByProjectAlias(ctx, &pb.GetProjectByProjectAliasRequest{
			ProjectAlias: newProjectAlias,
		})
		require.NotNil(t, err)
		require.Nil(t, res6)
	})
}
