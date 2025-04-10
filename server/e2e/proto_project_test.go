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

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI ./e2e/...

func TestInternalAPI(t *testing.T) {
	GRPCServer(t, baseSeeder)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{
		"authorization": "Bearer test",
		"user-id":       uID.String(),
	}))

	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}
	defer SafeClose(conn)

	client := pb.NewReEarthVisualizerClient(conn)

	// -------- private Project
	res, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
		TeamId:      wID.String(),
		Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
		Name:        lo.ToPtr("Test Project1"),
		Description: lo.ToPtr("Test Description1"),
		CoreSupport: lo.ToPtr(true),
		Visibility:  lo.ToPtr("private"),
	})
	assert.Nil(t, err)

	// -------- private Project not found
	_, err = client.GetProject(ctx, &pb.GetProjectRequest{
		ProjectId: res.Project.Id,
	})
	if err == nil {
		t.Error("expected error, got nil")
		return
	}

	// -------- create public Project
	res, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
		TeamId:      wID.String(),
		Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
		Name:        lo.ToPtr("Test Project2"),
		Description: lo.ToPtr("Test Description2"),
		CoreSupport: lo.ToPtr(true),
		Visibility:  lo.ToPtr("public"),
	})
	assert.Nil(t, err)

	// -------- public Project found
	res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
		ProjectId: res.Project.Id,
	})
	assert.Nil(t, err)
	assert.Equal(t, "Test Project2", res2.Project.Name)
	assert.Equal(t, "Test Description2", res2.Project.Description)
	assert.Equal(t, true, res2.Project.CoreSupport)
	assert.Equal(t, "public", res2.Project.Visibility)

	// -------- create public Project 2nd
	_, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
		TeamId:      wID.String(),
		Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
		Name:        lo.ToPtr("Test Project3"),
		Description: lo.ToPtr("Test Description3"),
		CoreSupport: lo.ToPtr(true),
		Visibility:  lo.ToPtr("public"),
	})
	assert.Nil(t, err)

	// -------- public list size 2
	res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
		TeamId: wID.String(),
	})
	assert.Nil(t, err)
	assert.Equal(t, len(res3.Projects), 2)

	// -------- delete Project
	_, err = client.DeleteProject(ctx, &pb.DeleteProjectRequest{
		ProjectId: res.Project.Id,
	})
	assert.Nil(t, err)

	// -------- public list size 2 -> 1
	res3, err = client.GetProjectList(ctx, &pb.GetProjectListRequest{
		TeamId: wID.String(),
	})
	assert.Nil(t, err)
	assert.Equal(t, len(res3.Projects), 1)
}

func SafeClose(c io.Closer) {
	if err := c.Close(); err != nil {
		log.Printf("warning: failed to close: %v", err)
	}
}
