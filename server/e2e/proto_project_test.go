package e2e

import (
	"context"
	"io"
	"log"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
)

func SafeClose(c io.Closer) {
	if err := c.Close(); err != nil {
		log.Printf("warning: failed to close: %v", err)
	}
}

func TestInternalAPI_private(t *testing.T) {
	GRPCServer(t, baseSeeder)

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// -------- default Project
		res, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			TeamId:      wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			// Visibility:  lo.ToPtr("private"),
		})
		assert.Nil(t, err)

		// -------- private
		res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: res.Project.Id,
		})
		assert.Nil(t, err)
		assert.Equal(t, "private", res2.Project.Visibility)

		// -------- private Project
		res, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
			TeamId:      wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("private"),
		})
		assert.Nil(t, err)

		// -------- private
		res2, err = client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: res.Project.Id,
		})
		assert.Nil(t, err)
		assert.Equal(t, "private", res2.Project.Visibility)

		// -------- public list size 3
		// 0: creante seeder => null
		// 1: creante default => private
		// 2: creante private => private
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			TeamId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res3.Projects))
		assert.Equal(t, "", res3.Projects[0].Visibility)
		assert.Equal(t, "private", res3.Projects[1].Visibility)
		assert.Equal(t, "private", res3.Projects[2].Visibility)
	})

	// User2 test
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// -------- public list size 0 (Not authenticated)
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			TeamId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 0, len(res3.Projects))
	})
}

func TestInternalAPI_public(t *testing.T) {
	GRPCServer(t, baseSeeder)

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// -------- public Project
		res, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			TeamId:      wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})
		assert.Nil(t, err)

		// -------- public
		res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: res.Project.Id,
		})
		assert.Nil(t, err)
		assert.Equal(t, "public", res2.Project.Visibility)

		// -------- private Project
		res, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
			TeamId:      wID.String(),
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("private"),
		})
		assert.Nil(t, err)

		// -------- private
		res2, err = client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: res.Project.Id,
		})
		assert.Nil(t, err)
		assert.Equal(t, "private", res2.Project.Visibility)

		// -------- list size 3
		// 0: creante seeder => null
		// 1: creante public => public
		// 2: creante private => private
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			TeamId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res3.Projects))
		assert.Equal(t, "", res3.Projects[0].Visibility)
		assert.Equal(t, "public", res3.Projects[1].Visibility)
		assert.Equal(t, "private", res3.Projects[2].Visibility)
	})

	// User2 test
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// -------- public list size 1 (Not authenticated)
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			TeamId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 1, len(res3.Projects))
	})
}

func runTestWithUser(t *testing.T, userID string, testFunc func(client pb.ReEarthVisualizerClient, ctx context.Context)) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{
		"authorization": "Bearer test",
		"user-id":       userID,
	}))

	conn, err := grpc.NewClient("localhost:8080", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}
	defer SafeClose(conn)

	client := pb.NewReEarthVisualizerClient(conn)
	testFunc(client, ctx)
}
