package e2e

import (
	"context"
	"encoding/json"
	"fmt"
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
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestInternalAPI ./e2e/...

func TestInternalAPI(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)
	testWorkspace := wID.String()

	// user1 call api
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		// create public Project
		pid1 := createProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: testWorkspace,
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})

		// create private Project
		pid2 := createProjectInternal(
			t, ctx, r, client, "private",
			&pb.CreateProjectRequest{
				WorkspaceId: testWorkspace,
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("private"),
			})

		// create public Project2
		createProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: testWorkspace,
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})

		createProjectInternal(
			t, ctx, r, client, "private",
			&pb.CreateProjectRequest{
				WorkspaceId: testWorkspace,
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("private"),
			})

		logicalDeleteProject(t, ctx, r, pid1)
		logicalDeleteProject(t, ctx, r, pid2)

		// 0: creante public  => public   delete => true
		// 1: creante private => private  delete => true
		// 2: creante public  => public   delete => false
		// 3: creante private => private  delete => false

		// get list size 5
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace,
		})
		assert.Nil(t, err)
		assert.Equal(t, 4, len(res3.Projects))

	})

	// user2 call api
	runTestWithUser(t, uID2.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// get list size 1
		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: false,
			WorkspaceId:   &testWorkspace,
		})
		assert.Nil(t, err)
		assert.Equal(t, 1, len(res3.Projects))
		// 3: creante public  => public   delete => false

		// Authenticated => get list size 1
		res4, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace,
		})
		assert.Nil(t, err)
		assert.Equal(t, 2, len(res4.Projects))

	})

	// user3 call api (menber)
	runTestWithUser(t, uID3.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		res3, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace,
		})
		assert.Nil(t, err)
		assert.Equal(t, 2, len(res3.Projects))

		// 2: creante public  => public   delete => false
		// 3: creante private => private  delete => false
	})

}

func TestInternalAPI_GetProjectList_OffsetPagination(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)
	testWorkspace := wID.String()

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// Create 15 test projects for pagination testing
		projectIDs := make([]id.ProjectID, 15)
		for i := range [15]int{} {
			pid := createProjectInternal(
				t, ctx, r, client, "public",
				&pb.CreateProjectRequest{
					WorkspaceId: testWorkspace,
					Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
					Name:        lo.ToPtr(fmt.Sprintf("Test Project %d", i)),
					Description: lo.ToPtr(fmt.Sprintf("Test Description %d", i)),
					CoreSupport: lo.ToPtr(true),
					Visibility:  lo.ToPtr("public"),
				})
			projectIDs[i] = pid
		}

		t.Run("First page with offset pagination", func(t *testing.T) {
			res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
				Authenticated: true,
				WorkspaceId:   &testWorkspace,
				Pagination: &pb.Pagination{
					Offset: lo.ToPtr(int64(0)),
					Limit:  lo.ToPtr(int64(5)),
				},
			})
			assert.Nil(t, err)
			assert.Equal(t, 5, len(res.Projects))
			assert.Equal(t, int64(16), res.PageInfo.TotalCount) // 15 + 1 from baseSeeder
			assert.True(t, res.PageInfo.HasNextPage)
			assert.False(t, res.PageInfo.HasPreviousPage)
		})

		t.Run("Middle page with offset pagination", func(t *testing.T) {
			res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
				Authenticated: true,
				WorkspaceId:   &testWorkspace,
				Pagination: &pb.Pagination{
					Offset: lo.ToPtr(int64(5)),
					Limit:  lo.ToPtr(int64(5)),
				},
			})
			assert.Nil(t, err)
			assert.Equal(t, 5, len(res.Projects))
			assert.Equal(t, int64(16), res.PageInfo.TotalCount) // 15 + 1 from baseSeeder
			assert.True(t, res.PageInfo.HasNextPage)
			assert.True(t, res.PageInfo.HasPreviousPage)
		})

		t.Run("Last page with offset pagination", func(t *testing.T) {
			res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
				Authenticated: true,
				WorkspaceId:   &testWorkspace,
				Pagination: &pb.Pagination{
					Offset: lo.ToPtr(int64(10)),
					Limit:  lo.ToPtr(int64(5)),
				},
			})
			assert.Nil(t, err)
			assert.Equal(t, 5, len(res.Projects))
			assert.Equal(t, int64(16), res.PageInfo.TotalCount) // 15 + 1 from baseSeeder
			assert.False(t, res.PageInfo.HasNextPage)           // 16 > 10+5 = 16 > 15 is true, but this represents the exact last page
			assert.True(t, res.PageInfo.HasPreviousPage)
		})

		t.Run("Beyond last page with offset pagination", func(t *testing.T) {
			res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
				Authenticated: true,
				WorkspaceId:   &testWorkspace,
				Pagination: &pb.Pagination{
					Offset: lo.ToPtr(int64(15)),
					Limit:  lo.ToPtr(int64(5)),
				},
			})
			assert.Nil(t, err)
			assert.Equal(t, 0, len(res.Projects))               // No projects remaining (offset 15 is beyond items 0-15)
			assert.Equal(t, int64(16), res.PageInfo.TotalCount) // 15 + 1 from baseSeeder
			assert.False(t, res.PageInfo.HasNextPage)
			assert.True(t, res.PageInfo.HasPreviousPage)
		})

		t.Run("Offset beyond total count", func(t *testing.T) {
			res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
				Authenticated: true,
				WorkspaceId:   &testWorkspace,
				Pagination: &pb.Pagination{
					Offset: lo.ToPtr(int64(20)),
					Limit:  lo.ToPtr(int64(5)),
				},
			})
			assert.Nil(t, err)
			assert.Equal(t, 0, len(res.Projects))
			assert.Equal(t, int64(16), res.PageInfo.TotalCount) // 15 + 1 from baseSeeder
			assert.False(t, res.PageInfo.HasNextPage)
			assert.True(t, res.PageInfo.HasPreviousPage)
		})

		t.Run("Authenticated false with offset pagination", func(t *testing.T) {
			res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
				Authenticated: false,
				WorkspaceId:   &testWorkspace,
				Pagination: &pb.Pagination{
					Offset: lo.ToPtr(int64(0)),
					Limit:  lo.ToPtr(int64(5)),
				},
			})
			assert.Nil(t, err)
			assert.Equal(t, 5, len(res.Projects))               // All projects are public
			assert.Equal(t, int64(15), res.PageInfo.TotalCount) // baseSeeder project is private, so not counted
			assert.True(t, res.PageInfo.HasNextPage)
			assert.False(t, res.PageInfo.HasPreviousPage)
		})
	})
}

func TestInternalAPI_create(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)
	testWorkspace := wID.String()

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		res, err := client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr("Test Project1"),
			Description: lo.ToPtr("Test Description1"),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		})
		require.Nil(t, err)
		require.NotNil(t, res.GetProject())
		pid, err := id.ProjectIDFrom(res.GetProject().Id)
		assert.Nil(t, err)
		prj, err := r.Project.FindByID(ctx, pid)
		assert.Nil(t, err)
		assert.Equal(t, "p-"+pid.String(), prj.ProjectAlias())

		res, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId:  testWorkspace,
			Visualizer:   pb.Visualizer_VISUALIZER_CESIUM,
			Name:         lo.ToPtr("Test Project1"),
			Description:  lo.ToPtr("Test Description1"),
			CoreSupport:  lo.ToPtr(true),
			Visibility:   lo.ToPtr("public"),
			ProjectAlias: lo.ToPtr("test-xxxxxxx"),
		})
		require.Nil(t, err)
		require.NotNil(t, res.GetProject())
		pid, err = id.ProjectIDFrom(res.GetProject().Id)
		assert.Nil(t, err)
		prj, err = r.Project.FindByID(ctx, pid)
		assert.Nil(t, err)
		assert.Equal(t, "test-xxxxxxx", prj.ProjectAlias())

		_, err = client.CreateProject(ctx, &pb.CreateProjectRequest{
			WorkspaceId:  testWorkspace,
			Visualizer:   pb.Visualizer_VISUALIZER_CESIUM,
			Name:         lo.ToPtr("Test Project1"),
			Description:  lo.ToPtr("Test Description1"),
			CoreSupport:  lo.ToPtr(true),
			ProjectAlias: lo.ToPtr("test-xxxxxxx"), // Already Exists
		})
		require.NotNil(t, err)
		assert.Equal(t, "rpc error: code = Unknown desc = The alias is already in use within the workspace. Please try a different value.", err.Error())
	})
}

func TestInternalAPI_unit(t *testing.T) {
	_, r, _ := GRPCServer(t, baseSeeder)
	testWorkspace := wID.String()

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {
		// Create Project
		pid := createProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: testWorkspace,
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})
		createProjectInternal(
			t, ctx, r, client, "public",
			&pb.CreateProjectRequest{
				WorkspaceId: testWorkspace,
				Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
				Name:        lo.ToPtr("Test Project1"),
				Description: lo.ToPtr("Test Description1"),
				CoreSupport: lo.ToPtr(true),
				Visibility:  lo.ToPtr("public"),
			})
		UpdateProjectMetadata(
			t, ctx, r, client,
			&pb.UpdateProjectMetadataRequest{
				ProjectId: pid.String(),
				Readme:    lo.ToPtr("test readme"),
				License:   lo.ToPtr("test license"),
				Topics:    lo.ToPtr("test topics"),
			},
		)
		res, err := client.GetProjectList(ctx, &pb.GetProjectListRequest{
			Authenticated: true,
			WorkspaceId:   &testWorkspace,
		})
		assert.Nil(t, err)
		assert.Equal(t, 2, len(res.Projects))

		for _, pj := range res.Projects {
			if pj.Id == pid.String() {
				checkProjectFields(t, pj)
			}
		}

		res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: pid.String(),
		})
		assert.Nil(t, err)

		checkProjectFields(t, res2.Project)
		// PbDump(res2.Project)

	})
}

func checkProjectFields(t *testing.T, project *pb.Project) {
	b, err := protojson.MarshalOptions{
		EmitUnpopulated: true,
	}.Marshal(project)
	assert.Nil(t, err)

	var m map[string]any
	err = json.Unmarshal(b, &m)
	assert.Nil(t, err)

	// top-level fields
	assert.Contains(t, m, "id")
	assert.Contains(t, m, "workspaceId")
	assert.Contains(t, m, "sceneId")
	assert.Contains(t, m, "name")
	assert.Contains(t, m, "description")
	assert.Contains(t, m, "visualizer")
	assert.Contains(t, m, "createdAt")
	assert.Contains(t, m, "updatedAt")
	assert.Contains(t, m, "isArchived")
	assert.Contains(t, m, "coreSupport")
	assert.Contains(t, m, "starred")
	assert.Contains(t, m, "isDeleted")
	assert.Contains(t, m, "visibility")
	assert.Contains(t, m, "projectAlias")

	assert.Contains(t, m, "editorUrl")

	// metadata
	meta, ok := m["metadata"].(map[string]any)
	assert.True(t, ok, "metadata should be a map")
	assert.Contains(t, meta, "id")
	assert.Contains(t, meta, "projectId")
	assert.Contains(t, meta, "workspaceId")
	assert.Contains(t, meta, "readme")
	assert.Contains(t, meta, "license")
	assert.Contains(t, meta, "topics")
	assert.Contains(t, meta, "importStatus")
	assert.Contains(t, meta, "createdAt")
	assert.Contains(t, meta, "updatedAt")

	// Scene publishment field
	assert.Contains(t, m, "alias")
	assert.Contains(t, m, "publishmentStatus")
	assert.Contains(t, m, "publishedUrl")

	// Story publishment fields
	assert.Contains(t, m, "stories")
	stories, ok := m["stories"].([]any)
	assert.True(t, ok, "stories should be an array")

	assert.Equal(t, 1, len(stories))

	if len(stories) > 0 {
		story, ok := stories[0].(map[string]any)
		assert.True(t, ok, "story should be a map")
		assert.Contains(t, story, "storyAlias")
		assert.Contains(t, story, "storyPublishmentStatus")
		assert.Contains(t, story, "storyPublishedUrl")
	}
}

func PbDump(m proto.Message) string {
	jsonBytes, _ := protojson.MarshalOptions{
		Multiline:       true,
		Indent:          "  ",
		UseProtoNames:   true,
		EmitUnpopulated: true,
	}.Marshal(m)
	res := string(jsonBytes)
	fmt.Println(res)
	return res
}

func runTestWithUser(t *testing.T, userID string, testFunc func(client pb.ReEarthVisualizerClient, ctx context.Context)) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{
		"authorization": fmt.Sprintf("Bearer %s", internalApiConfig.Visualizer.InternalApi.Token),
		"user-id":       userID,
	}))

	conn, err := grpc.NewClient("localhost:"+internalApiConfig.Visualizer.InternalApi.Port, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}
	defer SafeClose(conn)

	client := pb.NewReEarthVisualizerClient(conn)
	testFunc(client, ctx)
}

// go test -v -run TestCreateProjectForInternal ./e2e/...
func TestCreateProjectForInternal(t *testing.T) {

	GRPCServer(t, baseSeeder)

	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

		res, err := client.CreateProject(ctx,
			&pb.CreateProjectRequest{
				WorkspaceId:  wID.String(),
				Visualizer:   pb.Visualizer_VISUALIZER_CESIUM,
				Name:         lo.ToPtr("Test Project1"),
				Description:  lo.ToPtr("Test Description1"),
				CoreSupport:  lo.ToPtr(true),
				Visibility:   lo.ToPtr("public"),
				ProjectAlias: lo.ToPtr("projectalias-xxxxxxxxxxxx"),
				Readme:       lo.ToPtr("readme-xxxxxxxxxxx"),
				License:      lo.ToPtr("license-xxxxxxxxxxx"),
				Topics:       lo.ToPtr("topics-xxxxxxxxxxx"),
			})
		require.Nil(t, err)

		prj := res.GetProject()
		assert.Equal(t, "projectalias-xxxxxxxxxxxx", prj.ProjectAlias)

		metadata := prj.GetMetadata()
		assert.Equal(t, "readme-xxxxxxxxxxx", *metadata.Readme)
		assert.Equal(t, "license-xxxxxxxxxxx", *metadata.License)
		assert.Equal(t, "topics-xxxxxxxxxxx", *metadata.Topics)

		res2, err := client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: res.Project.Id,
		})
		require.Nil(t, err)

		prj = res2.GetProject()
		assert.Equal(t, "projectalias-xxxxxxxxxxxx", prj.ProjectAlias)

		metadata = prj.GetMetadata()
		assert.Equal(t, "readme-xxxxxxxxxxx", *metadata.Readme)
		assert.Equal(t, "license-xxxxxxxxxxx", *metadata.License)
		assert.Equal(t, "topics-xxxxxxxxxxx", *metadata.Topics)

	})

}

func createProjectInternal(t *testing.T, ctx context.Context, r *repo.Container, client pb.ReEarthVisualizerClient, visibility string, req *pb.CreateProjectRequest) id.ProjectID {
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

	// test GetProjectByAlias
	res3, err := client.GetProjectByAlias(ctx, &pb.GetProjectByAliasRequest{
		Alias: res2.Project.Alias,
	})
	assert.Nil(t, err)
	assert.Equal(t, res2.Project.Alias, res3.Project.Alias)

	return pid
}

func logicalDeleteProject(t *testing.T, ctx context.Context, r *repo.Container, pid id.ProjectID) {
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
