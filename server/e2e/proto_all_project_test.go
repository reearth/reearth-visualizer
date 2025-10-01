package e2e

import (
	"context"
	"fmt"
	"strings"
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

	// Create 10 public projects with different names, varying star counts, and topics
	publicProjects := make([]string, 10)
	projectStarCounts := make(map[string]int)
	projectTopics := make(map[string][]string)
	
	// Define some topics to assign to projects
	topicsList := []string{
		"visualization", "mapping", "3d-models", "geographic", 
		"terrain", "satellite", "analysis", "urban-planning",
		"climate", "environment", "development", "infrastructure",
	}
	
	for i := 0; i < 10; i++ {
		name := fmt.Sprintf("Public Project %d", i)
		description := fmt.Sprintf("Description for public project %d", i)
		
		// Assign different star counts to test sorting
		// Projects at even indices will have star count = index*10
		// Projects at odd indices will have star count = index*5
		// This creates a non-sequential star count distribution to test sorting
		
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
		
		// Store expected star counts for verification
		var starCount int
		if i%2 == 0 {
			starCount = i * 10
		} else {
			starCount = i * 5
		}
		projectStarCounts[res.Project.Id] = starCount
		
		var projectTopicList []string
		topicCount := (i % 3) + 1  // 1-3 topics per project
		for j := 0; j < topicCount; j++ {
			topicIndex := (i + j) % len(topicsList)  // Pick topics based on project index
			projectTopicList = append(projectTopicList, topicsList[topicIndex])
		}
		projectTopics[res.Project.Id] = projectTopicList
		
		// Update project metadata to add topics
		if len(projectTopicList) > 0 {
			// Join topics with comma for the API
			topicsStr := strings.Join(projectTopicList, ",")
			
			// Update project metadata with topics
			_, err := client.UpdateProjectMetadata(ctx, &pb.UpdateProjectMetadataRequest{
				ProjectId: res.Project.Id,
				Topics:    lo.ToPtr(topicsStr),
			})
			require.NoError(t, err)
		}
		
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

	// Test case 4: Search with keyword in name
	t.Run("SearchWithKeywordInName", func(t *testing.T) {
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
	
	// Test case 4-B: Search with keyword in topics
	t.Run("SearchWithKeywordInTopics", func(t *testing.T) {
		// Choose a topic that was assigned to at least one project
		keyword := "visualization"
		searchField := pb.SearchFieldType_SEARCH_FIELD_TYPE_TOPICS
		
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Keyword: &keyword,
			SearchField: &searchField,
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Should return some projects with the topic
		assert.NotEmpty(t, res.Projects, "Should find projects with topic: "+keyword)
		
		// Verify projects have metadata and the topic is included in their topics
		for _, proj := range res.Projects {
			// Skip projects without metadata
			if proj.Metadata == nil {
				continue
			}
			
			// Check if any of the project's topics contain the keyword
			topicFound := false
			for _, topic := range proj.Metadata.Topics {
				if topic == keyword {
					topicFound = true
					break
				}
			}
			
			assert.True(t, topicFound, 
				fmt.Sprintf("Project %s should have the topic %s", proj.Id, keyword))
		}
	})
	
	// Test case 4-C: Search with multiple keywords in topics (comma-separated)
	t.Run("SearchWithMultipleKeywordsInTopics", func(t *testing.T) {
		// Search for projects that have either "mapping" or "urban-planning" as topics
		keyword := "mapping,urban-planning"
		searchField := pb.SearchFieldType_SEARCH_FIELD_TYPE_TOPICS
		
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Keyword: &keyword,
			SearchField: &searchField,
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Should return some projects with either of the topics
		assert.NotEmpty(t, res.Projects, "Should find projects with topics: "+keyword)
		
		// Convert the search keywords to a slice for easier comparison
		searchTopics := strings.Split(keyword, ",")
		
		// Verify that each returned project has at least one of the search topics
		for _, proj := range res.Projects {
			// Skip projects without metadata
			if proj.Metadata == nil {
				continue
			}
			
			// Check if any of the project's topics match any of our search topics
			var matchFound bool
			for _, projectTopic := range proj.Metadata.Topics {
				for _, searchTopic := range searchTopics {
					if projectTopic == searchTopic {
						matchFound = true
						break
					}
				}
				if matchFound {
					break
				}
			}
			
			assert.True(t, matchFound, 
				fmt.Sprintf("Project %s should have at least one of the topics: %s", 
					proj.Id, keyword))
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
	
	// Test case 6: Sort by updated_at (ascending)
	t.Run("SortByUpdatedAtAscending", func(t *testing.T) {
		// Create a sort parameter for updated_at ascending
		sortField := pb.ProjectSortField_UPDATEDAT
		sortDirection := pb.SortDirection_ASC
		
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Sort: &pb.ProjectSort{
				Field: sortField,
				Direction: sortDirection,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Verify at least 2 projects are returned to check sorting
		require.GreaterOrEqual(t, len(res.Projects), 2)
		
		// Verify projects are sorted by updated_at in ascending order
		for i := 0; i < len(res.Projects) - 1; i++ {
			currProject := res.Projects[i]
			nextProject := res.Projects[i+1]
			
			// Compare timestamps (older timestamps first)
			assert.True(t, currProject.UpdatedAt.AsTime().Before(nextProject.UpdatedAt.AsTime()) || 
				currProject.UpdatedAt.AsTime().Equal(nextProject.UpdatedAt.AsTime()),
				"Projects should be sorted by updated_at in ascending order")
		}
	})
	
	// Test case 7: Sort by updated_at (descending)
	t.Run("SortByUpdatedAtDescending", func(t *testing.T) {
		// Create a sort parameter for updated_at descending
		sortField := pb.ProjectSortField_UPDATEDAT
		sortDirection := pb.SortDirection_DESC
		
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Sort: &pb.ProjectSort{
				Field: sortField,
				Direction: sortDirection,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Verify at least 2 projects are returned to check sorting
		require.GreaterOrEqual(t, len(res.Projects), 2)
		
		// Verify projects are sorted by updated_at in descending order
		for i := 0; i < len(res.Projects) - 1; i++ {
			currProject := res.Projects[i]
			nextProject := res.Projects[i+1]
			
			// Compare timestamps (newer timestamps first)
			assert.True(t, currProject.UpdatedAt.AsTime().After(nextProject.UpdatedAt.AsTime()) || 
				currProject.UpdatedAt.AsTime().Equal(nextProject.UpdatedAt.AsTime()),
				"Projects should be sorted by updated_at in descending order")
		}
	})
	
	// Test case 8: Sort by star count (ascending)
	t.Run("SortByStarCountAscending", func(t *testing.T) {
		// Create a sort parameter for star count ascending
		sortField := pb.ProjectSortField_STARCOUNT
		sortDirection := pb.SortDirection_ASC
		
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Sort: &pb.ProjectSort{
				Field: sortField,
				Direction: sortDirection,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Verify at least 2 projects are returned to check sorting
		require.GreaterOrEqual(t, len(res.Projects), 2)
		
		// Verify projects are sorted by star count in ascending order
		for i := 0; i < len(res.Projects) - 1; i++ {
			currProject := res.Projects[i]
			nextProject := res.Projects[i+1]
			assert.LessOrEqual(t, currProject.StarCount, nextProject.StarCount,
				"Projects should be sorted by star count in ascending order")
		}
	})
	
	// Test case 9: Sort by star count (descending)
	t.Run("SortByStarCountDescending", func(t *testing.T) {
		// Create a sort parameter for star count descending
		sortField := pb.ProjectSortField_STARCOUNT
		sortDirection := pb.SortDirection_DESC
		
		res, err := client.GetAllProjects(ctx, &pb.GetAllProjectsRequest{
			Sort: &pb.ProjectSort{
				Field: sortField,
				Direction: sortDirection,
			},
		})
		require.NoError(t, err)
		require.NotNil(t, res)
		require.NotNil(t, res.Projects)
		
		// Verify at least 2 projects are returned to check sorting
		require.GreaterOrEqual(t, len(res.Projects), 2)
		
		// Verify projects are sorted by star count in descending order
		for i := 0; i < len(res.Projects) - 1; i++ {
			currProject := res.Projects[i]
			nextProject := res.Projects[i+1]
			assert.GreaterOrEqual(t, currProject.StarCount, nextProject.StarCount,
				"Projects should be sorted by star count in descending order")
		}
	})
	
	// Test case 10: Get a specific public project by ID
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