package e2e

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
)

// Test GetAllProjects endpoint with various pagination and search parameters
// go test -v -run TestGetAllProjects ./e2e/...

func TestGetAllProjects(t *testing.T) {
	GRPCServer(t, baseSeeder)
	testWorkspace := wID.String()
	
	// user1 creates projects and tests public project listing
	runTestWithUser(t, uID.String(), func(client pb.ReEarthVisualizerClient, ctx context.Context) {

	// Create 10 public projects with different names
	publicProjects := make([]string, 10)
	for i := 0; i < 10; i++ {
		name := fmt.Sprintf("Public Project %d", i)
		description := fmt.Sprintf("Description for public project %d", i)
		
		req := &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr(name),
			Description: lo.ToPtr(description),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("public"),
		}
		
		res, err := client.CreateProject(ctx, req)
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Project)
		require.NotEmpty(t, res.Project.Id)
		
		publicProjects[i] = res.Project.Id
		
		// Add a small delay to ensure different timestamps
		time.Sleep(100 * time.Millisecond)
	}

	// Create 5 private projects (should not appear in results)
	privateProjects := make([]string, 5)
	for i := 0; i < 5; i++ {
		name := fmt.Sprintf("Private Project %d", i)
		description := fmt.Sprintf("Description for private project %d", i)
		
		req := &pb.CreateProjectRequest{
			WorkspaceId: testWorkspace,
			Visualizer:  pb.Visualizer_VISUALIZER_CESIUM,
			Name:        lo.ToPtr(name),
			Description: lo.ToPtr(description),
			CoreSupport: lo.ToPtr(true),
			Visibility:  lo.ToPtr("private"),
		}
		
		res, err := client.CreateProject(ctx, req)
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Project)
		require.NotEmpty(t, res.Project.Id)
		
		privateProjects[i] = res.Project.Id
	}

	// Test case 1: Get all projects (default pagination)
	t.Run("GetAllProjects", func(t *testing.T) {
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Should return at least our 10 created public projects
		assert.GreaterOrEqual(t, len(res.Projects), 10)
		
		// Verify all returned projects are public
		for _, proj := range res.Projects {
			assert.Equal(t, "public", proj.Visibility)
		}
	})

	// Test case 2: Pagination with limit (first)
	t.Run("PaginationWithFirst", func(t *testing.T) {
		first := int32(5)
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Pagination: &pb.Pagination{
				First: &first,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Should return exactly 5 projects
		assert.Equal(t, 5, len(res.Projects))
		
		// Verify cursor-based pagination info
		require.NotNil(t, res.PageInfo)
		assert.NotEmpty(t, res.PageInfo.EndCursor)
	})

	// Test case 3: Pagination with after (next page)
	t.Run("PaginationWithAfter", func(t *testing.T) {
		// First get initial page
		first := int32(5)
		initialRes, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Pagination: &pb.Pagination{
				First: &first,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, initialRes)
		require.NotNil(t, initialRes.PageInfo)
		require.NotNil(t, initialRes.PageInfo.EndCursor)
		
		// Now get the next page using the cursor
		nextRes, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Pagination: &pb.Pagination{
				First: &first,
				After: initialRes.PageInfo.EndCursor,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, nextRes)
		require.NotNil(t, nextRes.Projects)
		
		// Should return some projects
		assert.NotEmpty(t, nextRes.Projects)
		
		// Projects on next page should be different from first page
		firstPageIds := lo.Map(initialRes.Projects, func(p *pb.Project, _ int) string {
			return p.Id
		})
		nextPageIds := lo.Map(nextRes.Projects, func(p *pb.Project, _ int) string {
			return p.Id
		})
		
		for _, id := range nextPageIds {
			assert.NotContains(t, firstPageIds, id)
		}
	})

	// Test case 4: Search with keyword
	t.Run("SearchWithKeyword", func(t *testing.T) {
		keyword := "Public Project 3"
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Keyword: &keyword,
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Should match projects with the keyword in the name
		for _, proj := range res.Projects {
			assert.Contains(t, proj.Name, keyword)
		}
	})

	// Test case 5: Limit and offset pagination
	t.Run("LimitOffsetPagination", func(t *testing.T) {
		limit := int64(3)
		offset := int64(4)
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Pagination: &pb.Pagination{
				Limit:  &limit,
				Offset: &offset,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Should return exactly 3 projects (the limit)
		assert.Equal(t, 3, len(res.Projects))
	})
	
	// Test case 6: Get a specific public project by ID
	t.Run("GetSpecificPublicProject", func(t *testing.T) {
		// Use one of the public project IDs we created
		projectId := publicProjects[2]
		
		// First verify we can access it via GetProject
		projectRes, err := client.GetProject(ctx, &pb.GetProjectRequest{
			ProjectId: projectId,
		})
		require.NoError(t, err)
		require.NotNil(t, projectRes)
		require.NotNil(t, projectRes.Project)
		assert.Equal(t, projectId, projectRes.Project.Id)
		assert.Equal(t, "public", projectRes.Project.Visibility)
	})

	// Clean up - delete all test projects
	for _, id := range publicProjects {
		_, err := client.DeleteProject(ctx, &pb.DeleteProjectRequest{
			ProjectId: id,
		})
		assert.NoError(t, err)
	}
	
	for _, id := range privateProjects {
		_, err := client.DeleteProject(ctx, &pb.DeleteProjectRequest{
			ProjectId: id,
		})
		assert.NoError(t, err)
	}
})
}