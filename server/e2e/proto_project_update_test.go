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

// go test -v -run TestInternalAPI_update ./e2e/...

func TestInternalAPI_update(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)

	var pid1 id.ProjectID
	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
		pid1 = createProjectInternal(
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
		projectAlias := "test-xxxxxx"

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
			ProjectAlias:      &projectAlias,
		})
		assert.Nil(t, err)
		assert.Equal(t, visibility, res.Project.Visibility)
		assert.Equal(t, name, res.Project.Name)
		assert.Equal(t, desc, res.Project.Description)
		assert.Equal(t, archived, res.Project.IsArchived)
		assert.Equal(t, imageUrl, *res.Project.ImageUrl)
		assert.Equal(t, starred, res.Project.Starred)
		assert.Equal(t, deleted, res.Project.IsDeleted)
		assert.Equal(t, projectAlias, res.Project.ProjectAlias)

		deleteImageUrl := true
		deletePublicImage := true
		_, err = client.UpdateProject(ctx, &pb.UpdateProjectRequest{
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

		// projectAlias update => OK
		_, err = client.UpdateProject(ctx, &pb.UpdateProjectRequest{
			ProjectId:    pid1.String(),
			ProjectAlias: &projectAlias,
		})
		assert.Nil(t, err)

		pid2 := createProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: wID.String(),
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})

		// projectAlias update => NG
		_, err = client.UpdateProject(ctx, &pb.UpdateProjectRequest{
			ProjectId:    pid2.String(),
			ProjectAlias: &projectAlias, // Already Exists
		})
		require.NotNil(t, err)
		assert.Equal(t, "rpc error: code = Unknown desc = The alias is already in use within the workspace. Please try a different value.", err.Error())
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
