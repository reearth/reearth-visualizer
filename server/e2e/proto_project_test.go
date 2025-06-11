package e2e

import (
	"context"
	"io"
	"log"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI ./e2e/...

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

		// 0: creante seeder => private
		// 1: creante default => private
		// 2: creante private => private

		// get list size 3
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res3.Projects))
		assert.Equal(t, "private", res3.Projects[0].Visibility)
		assert.Equal(t, "private", res3.Projects[1].Visibility)
		assert.Equal(t, "private", res3.Projects[2].Visibility)

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

		// 0: creante seeder => private
		// 1: creante public => public
		// 2: creante private => private

		// get list size 3
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res3.Projects))
		assert.Equal(t, "private", res3.Projects[0].Visibility)
		assert.Equal(t, "public", res3.Projects[1].Visibility)
		assert.Equal(t, "private", res3.Projects[2].Visibility)

		publicProjectId = res3.Projects[1].Id

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
			ProjectId: publicProjectId,
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

func TestInternalAPI(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
		pid1 := CreateProjectInternal(
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
		pid2 := CreateProjectInternal(
			t, ctx, r, client, "private",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("private"),
			})

		// create public Project2
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

		LogicalDeleteProject(t, ctx, r, pid1)
		LogicalDeleteProject(t, ctx, r, pid2)

		// 0: creante seeder  => private  delete => false
		// 1: creante public  => public   delete => true !!
		// 2: creante private => private  delete => true !!
		// 3: creante public  => public   delete => false
		// 4: creante private => private  delete => false

		// get list size 5
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 5, len(res3.Projects))

	})

	// user2 call api
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// get list size 1
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 1, len(res3.Projects))
		// 3: creante public  => public   delete => false

		// Authenticated => get list size 5
		res4, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId:   wID.String(),
			Authenticated: true,
		})
		assert.Nil(t, err)
		assert.Equal(t, 5, len(res4.Projects))

	})

	// user3 call api (menber)
	runTestWithUser(t, uID3.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// get list size 3
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			WorkspaceId: wID.String(),
		})
		assert.Nil(t, err)
		assert.Equal(t, 3, len(res3.Projects))

		// 0: creante seeder  => private  delete => false
		// 3: creante public  => public   delete => false
		// 4: creante private => private  delete => false
	})

}

func TestInternalAPI_update(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	var pid1 id.ProjectID
	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
		pid1 = CreateProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})

		name := "Updated Project Name"
		desc := "Updated Description"
		archived := true
		imageUrl := "https://example.com/image.png"
		starred := true
		deleted := false
		visibility := "private"
		publicTitle := "Public Title"
		publicDescription := "Public Description"
		publicImage := "https://example.com/public_image.png"
		publicNoIndex := true
		isBasicAuthActive := true
		basicAuthUsername := "user"
		basicAuthPassword := "pass"
		enableGa := true
		trackingId := "GA-XXXX"

		res, err := client.UpdateProject(ctx, &pb.UpdateProjectRequest{
			ProjectId:         pid1.String(),
			Name:              &name,
			Description:       &desc,
			Archived:          &archived,
			ImageUrl:          &imageUrl,
			Starred:           &starred,
			Deleted:           &deleted,
			Visibility:        &visibility,
			PublicTitle:       &publicTitle,
			PublicDescription: &publicDescription,
			PublicImage:       &publicImage,
			PublicNoIndex:     &publicNoIndex,
			IsBasicAuthActive: &isBasicAuthActive,
			BasicAuthUsername: &basicAuthUsername,
			BasicAuthPassword: &basicAuthPassword,
			EnableGa:          &enableGa,
			TrackingId:        &trackingId,
		})
		assert.Nil(t, err)
		assert.Equal(t, visibility, res.Project.Visibility)
		assert.Equal(t, name, res.Project.Name)
		assert.Equal(t, desc, res.Project.Description)
		assert.Equal(t, archived, res.Project.IsArchived)
		assert.Equal(t, imageUrl, *res.Project.ImageUrl)
		assert.Equal(t, starred, res.Project.Starred)
		assert.Equal(t, deleted, res.Project.IsDeleted)
		assert.Equal(t, publicTitle, res.Project.PublicTitle)
		assert.Equal(t, publicDescription, res.Project.PublicDescription)
		assert.Equal(t, publicImage, res.Project.PublicImage)
		assert.Equal(t, publicNoIndex, res.Project.PublicNoIndex)
		assert.Equal(t, isBasicAuthActive, res.Project.IsBasicAuthActive)
		assert.Equal(t, basicAuthUsername, res.Project.BasicAuthUsername)
		assert.Equal(t, basicAuthPassword, res.Project.BasicAuthPassword)
		assert.Equal(t, enableGa, res.Project.EnableGa)
		assert.Equal(t, trackingId, res.Project.TrackingId)

		deleteImageUrl := true
		deletePublicImage := true
		res, err = client.UpdateProject(ctx, &pb.UpdateProjectRequest{
			ProjectId:         pid1.String(),
			DeleteImageUrl:    &deleteImageUrl,
			DeletePublicImage: &deletePublicImage,
		})
		assert.Nil(t, err)
		res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: pid1.String(),
		})
		assert.Nil(t, err)
		assert.Nil(t, res2.Project.ImageUrl)
		assert.Equal(t, "", res2.Project.PublicImage)
	})

	// user2 call api
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		v := "public"
		res, err := client.UpdateProject(ctx, &pb.UpdateProjectRequest{
			ProjectId:  pid1.String(),
			Visibility: &v,
		})
		assert.NotNil(t, err) // error!
		assert.Nil(t, res)
	})

}

func runTestWithUser(t *testing.T, userID string, testFunc func(client pb.ReEarthVisualizerClient, ctx context.Context)) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{
		"user-id": userID,
	}))

	conn, err := grpc.NewClient("localhost:8080", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}
	defer SafeClose(conn)

	client := pb.NewReEarthVisualizerClient(conn)
	testFunc(client, ctx)
}

func CreateProjectInternal(t *testing.T, ctx context.Context, r *repo.Container, client pb.ReEarthVisualizerClient, visibility string, req *pb.CreateProjectRequest) id.ProjectID {
	// test CreateProject
	res, err := client.CreateProject(ctx, req)
	require.Nil(t, err)
	require.NotNil(t, res.GetProject())

	pid, err := id.ProjectIDFrom(res.GetProject().Id)
	assert.Nil(t, err)
	prj, err := r.Project.FindByID(ctx, pid)
	assert.Nil(t, err)
	c, err := r.Scene.FindByProject(ctx, prj.ID())
	assert.Nil(t, err)
	assert.NotNil(t, c)
	s, err := r.Storytelling.FindByScene(ctx, c.ID())
	assert.Nil(t, err)
	assert.Equal(t, 1, len(*s))
	// test GetProject
	res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
		ProjectId: res.Project.Id,
	})
	assert.Nil(t, err)
	assert.Equal(t, visibility, res2.Project.Visibility)
	return pid
}

func LogicalDeleteProject(t *testing.T, ctx context.Context, r *repo.Container, pid id.ProjectID) {
	prj, err := r.Project.FindByID(ctx, pid)
	assert.Nil(t, err)
	prj.SetDeleted(true)
	err = r.Project.Save(ctx, prj)
	assert.Nil(t, err)
}

func SafeClose(c io.Closer) {
	if err := c.Close(); err != nil {
		log.Printf("warning: failed to close: %v", err)
	}
}
