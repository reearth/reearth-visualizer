//go:build e2e

package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

// make e2e-test TEST_NAME=TestInternalAPI_private
func TestInternalAPI_private(t *testing.T) {
	_, r, _, result := GRPCServer(t, baseSeeder)

	// ------------------------------------------

	// user1: workspaceId: result.WID   userId: result.UID
	testWorkspace1 := result.WID.String()

	var user1PublicProjectId id.ProjectID

	// user1 call api
	runTestWithUser(t, result.UID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create default Project -> public
		createProjectInternal(t, ctx, r, client, "public", &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace1,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test User1 Default Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			// Visibility:  nil,
		})

		// create private Project
		createProjectInternal(t, ctx, r, client, "private", &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace1,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test User1 Private Project2"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("private"),
		})

		user1PublicProjectId = createProjectInternal(t, ctx, r, client, "public", &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace1,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test User1 Public Project3"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})

		// 0: creante public  => public
		// 1: creante private => private
		// 2: creante default => private

		// get list size 3
		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace1,
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res.Projects))

		assert.Equal(t, "Test User1 Public Project3", res.Projects[0].Name)
		assert.Equal(t, "public", res.Projects[0].Visibility)
		assert.Equal(t, res.Projects[0].Id, res.Projects[0].Metadata.ProjectId)

		assert.Equal(t, "Test User1 Private Project2", res.Projects[1].Name)
		assert.Equal(t, "private", res.Projects[1].Visibility)
		assert.Equal(t, res.Projects[1].Id, res.Projects[1].Metadata.ProjectId)

		assert.Equal(t, "Test User1 Default Project1", res.Projects[2].Name)
		assert.Equal(t, "public", res.Projects[2].Visibility)
		assert.Equal(t, res.Projects[2].Id, res.Projects[2].Metadata.ProjectId)
	})

	// ------------------------------------------

	// user2: workspaceId: result.WID2  userId: result.UID2
	testWorkspace2 := result.WID2.String()

	// user2 call api
	runTestWithUser(t, result.UID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create default Project -> public
		createProjectInternal(t, ctx, r, client, "public", &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace2,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test User2 Default Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			// Visibility:  nil,
		})

		// create private Project
		createProjectInternal(t, ctx, r, client, "private", &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace2,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test User2 Private Project2"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("private"),
		})

		createProjectInternal(t, ctx, r, client, "public", &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace2,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test User2 Public Project3"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})

		// 0: creante public  => public
		// 1: creante private => private
		// 2: creante default => private

		// get list size 3
		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace2,
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res.Projects))

		assert.Equal(t, "Test User2 Public Project3", res.Projects[0].Name)
		assert.Equal(t, "public", res.Projects[0].Visibility)
		assert.Equal(t, res.Projects[0].Id, res.Projects[0].Metadata.ProjectId)

		assert.Equal(t, "Test User2 Private Project2", res.Projects[1].Name)
		assert.Equal(t, "private", res.Projects[1].Visibility)
		assert.Equal(t, res.Projects[1].Id, res.Projects[1].Metadata.ProjectId)

		assert.Equal(t, "Test User2 Default Project1", res.Projects[2].Name)
		assert.Equal(t, "public", res.Projects[2].Visibility)
		assert.Equal(t, res.Projects[2].Id, res.Projects[2].Metadata.ProjectId)

		// get User1 Workspace => list size 1 public only
		res, err = client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace1, // User1 Workspace
		})

		assert.Nil(t, err)
		assert.Equal(t, 2, len(res.Projects))

		assert.Equal(t, "Test User1 Public Project3", res.Projects[0].Name)
		assert.Equal(t, "public", res.Projects[0].Visibility)
		assert.Equal(t, res.Projects[0].Id, res.Projects[0].Metadata.ProjectId)

	})

	// ------------------------------------------

	// user1 call api
	runTestWithUser(t, result.UID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// get User2 Workspace => list size 1 public only
		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace2, // User2 Workspace
		})
		assert.Nil(t, err)
		assert.Equal(t, 2, len(res.Projects))

		assert.Equal(t, "Test User2 Public Project3", res.Projects[0].Name)
		assert.Equal(t, "public", res.Projects[0].Visibility)
		assert.Equal(t, res.Projects[0].Id, res.Projects[0].Metadata.ProjectId)

		res2, err := client.DeleteProject(ctx, &pb.DeleteProjectRequest{
			ProjectId: user1PublicProjectId.String(), // public delete
		})
		assert.Nil(t, err)
		assert.NotNil(t, res2)
	})

	// ------------------------------------------

	// user2 call api
	runTestWithUser(t, result.UID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// get list size 1 public only
		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace1, // User1 Workspace
		})

		assert.Nil(t, err)
		assert.Equal(t, 1, len(res.Projects))

	})
}
