package e2e

import (
	"context"
	"testing"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestInternalAPI_private(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	// user1: workspaceId: wID   userId: uID
	// user2: workspaceId: wID2  userId: uID2

	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create default Project -> private
		CreateProjectInternal(
			t, ctx, r, client, "private",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				// Visibility:  nil,
			})

		// create private Project
		CreateProjectInternal(
			t, ctx, r, client, "private",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("private"),
			})

		// 0: creante default => private
		// 1: creante private => private

		// get list size 3
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 2, len(res3.Projects))
		assert.Equal(t, "private", res3.Projects[0].Visibility)
		assert.Equal(t, "private", res3.Projects[1].Visibility)

	})

	// user2 call api
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// get list size 0
		res4, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(), // not wID2
		})
		assert.Nil(t, err)
		assert.Equal(t, 0, len(res4.Projects))
	})

}

func TestInternalAPI_public(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	var publicProjectId string

	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
		CreateProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})

		// create private Project
		CreateProjectInternal(
			t, ctx, r, client, "private",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("private"),
			})

		// 0: creante public => public
		// 1: creante private => private

		// get list size 3
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 2, len(res3.Projects))
		assert.Equal(t, "public", res3.Projects[0].Visibility)
		assert.Equal(t, "private", res3.Projects[1].Visibility)

		publicProjectId = res3.Projects[0].Id

	})

	// user2 call api
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// get list size 1
		res4, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(), // not wID2
		})
		assert.Nil(t, err)
		assert.Equal(t, 1, len(res4.Projects))

		// test DeleteProject
		res5, err := client.DeleteProject(ctx, &pb.DeleteProjectRequest{
			ProjectId: publicProjectId,
		})
		assert.Equal(t, "rpc error: code = Unknown desc = operation denied", err.Error())
		assert.Nil(t, res5)

	})

	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// test DeleteProject
		res6, err := client.DeleteProject(ctx, &pb.DeleteProjectRequest{
			ProjectId: publicProjectId, // public delete => private only
		})
		assert.Nil(t, err)
		assert.NotNil(t, res6)

	})

	// user2 call api
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// get list size 0
		res7, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(), // not wID2
		})
		assert.Nil(t, err)
		assert.Equal(t, 0, len(res7.Projects))

	})

}
