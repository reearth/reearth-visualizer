package e2e

import (
	"context"
	"fmt"
	"net/url"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

const ProjectFragment = `
fragment ProjectFragment on Project {
  id
  workspaceId
  name
  description
  imageUrl
  createdAt
  updatedAt
  visualizer
  isArchived
  coreSupport
  starred
  isDeleted
  visibility
  projectAlias
  metadata {
    id
    ...ProjectMetadataFragment
  }
  alias
  publishmentStatus
  publishedAt
  publicTitle
  publicDescription
  publicImage
  publicNoIndex
  isBasicAuthActive
  basicAuthUsername
  basicAuthPassword
  enableGa
  trackingId
  __typename
}`

const ProjectMetadataFragment = `
fragment ProjectMetadataFragment on ProjectMetadata {
  project
  workspace
  readme
  license
  topics
  importStatus
  createdAt
  updatedAt
  __typename
}`

const GetProjectsQuery = `
query GetProjects(
  $workspaceId: ID!
  $pagination: Pagination
  $keyword: String
  $sort: ProjectSort
) {
  projects(
    workspaceId: $workspaceId
    pagination: $pagination
    keyword: $keyword
    sort: $sort
  ) {
    edges {
      node {
        id
        ...ProjectFragment
        scene {
          id
          __typename
        }
        __typename
      }
      __typename
    }
    nodes {
      id
      ...ProjectFragment
      scene {
        id
        __typename
      }
      __typename
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }
    totalCount
    __typename
  }
}
` + ProjectFragment + ProjectMetadataFragment

const CreateProjectMutation = `
mutation CreateProject(
  $workspaceId: ID!
  $visualizer: Visualizer!
  $name: String
  $description: String
  $coreSupport: Boolean
  $visibility: String
  $projectAlias: String
  $readme: String
  $license: String
  $topics: String
) {
  createProject(
    input: {
      workspaceId: $workspaceId
      visualizer: $visualizer
      name: $name
      description: $description
      coreSupport: $coreSupport
	  visibility: $visibility
	  projectAlias: $projectAlias
	  readme: $readme
	  license: $license
	  topics: $topics
    }
  ) {
    project {
	  ...ProjectFragment
      __typename
	}
    __typename
  }
}
` + ProjectFragment + ProjectMetadataFragment

func createProject(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.createProject.project.id").Raw().(string)
}

func createProject2(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.createProject.project")
}

const UpdateProjectMutation = `
mutation UpdateProject($input: UpdateProjectInput!) {
  updateProject(input: $input) {
    project {
	  ...ProjectFragment
      __typename
	}
    __typename
  }
}
` + ProjectFragment + ProjectMetadataFragment

func updateProject(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UpdateProject",
		Query:         UpdateProjectMutation,
		Variables:     variables,
	}
	return Request(e, u.String(), requestBody).
		Path("$.data.updateProject.project")
}

func updateProject2(e *httpexpect.Expect, u accountdomain.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UpdateProject",
		Query:         UpdateProjectMutation,
		Variables:     variables,
	}
	return Request(e, u.String(), requestBody)
}

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCreateUpdateProject ./e2e/...

func TestCreateUpdateProject(t *testing.T) {
	e := Server(t, baseSeeder)

	// cerate
	res := Request(e, uID.String(), GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables: map[string]any{
			"name":         "test",
			"description":  "abc",
			"workspaceId":  wID.String(),
			"visualizer":   "CESIUM",
			"coreSupport":  true,
			"visibility":   "public",
			"projectAlias": "test-xxxxxx",

			"readme":  "readme-xxxxxx",
			"license": "license-xxxxxx",
			"topics":  "topics-xxxxxx",
		},
	})

	res.Path("$.data.createProject.project.metadata.readme").IsEqual("readme-xxxxxx")
	res.Path("$.data.createProject.project.metadata.license").IsEqual("license-xxxxxx")
	res.Path("$.data.createProject.project.metadata.topics").IsEqual("topics-xxxxxx")

	res.Path("$.data.createProject.project.projectAlias").IsEqual("test-xxxxxx")
	projectID := res.Path("$.data.createProject.project.id").Raw().(string)

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"workspaceId": wID.String(),
			"pagination": map[string]any{
				"first": 16,
			},
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
		},
	}
	edges := Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()

	for _, edge := range edges.Iter() {
		if edge.Path("$.node.id").Raw().(string) == projectID {
			edge.Path("$.node.metadata.readme").IsEqual("readme-xxxxxx")
			edge.Path("$.node.metadata.license").IsEqual("license-xxxxxx")
			edge.Path("$.node.metadata.topics").IsEqual("topics-xxxxxx")
		}
	}

	// cerate
	res = Request(e, uID.String(), GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables: map[string]any{
			"name":         "test",
			"description":  "abc",
			"workspaceId":  wID.String(),
			"visualizer":   "CESIUM",
			"coreSupport":  true,
			"visibility":   "public",
			"projectAlias": "test-xxxxxx", // Already Exists
		},
	})
	res.Path("$.errors[0].message").IsEqual("The alias is already in use within the workspace. Please try a different value.")

	// update
	res = updateProject(e, uID, map[string]any{
		"input": map[string]any{
			"projectId":    projectID,
			"projectAlias": "test-yyyyy",
		},
	})
	res.Object().Value("projectAlias").IsEqual("test-yyyyy")

	// cerate
	res = Request(e, uID.String(), GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables: map[string]any{
			"name":         "test",
			"description":  "abc",
			"workspaceId":  wID.String(),
			"visualizer":   "CESIUM",
			"coreSupport":  true,
			"visibility":   "public",
			"projectAlias": "test-xxxxxx",
		},
	})
	res.Path("$.data.createProject.project.projectAlias").IsEqual("test-xxxxxx")
	projectID = res.Path("$.data.createProject.project.id").Raw().(string)

	// update
	res = updateProject2(e, uID, map[string]any{
		"input": map[string]any{
			"projectId":    projectID,
			"projectAlias": "test-yyyyy", // Already Exists
		},
	})
	res.Path("$.errors[0].message").IsEqual("The alias is already in use within the workspace. Please try a different value.")

	res = Request(e, uID.String(), GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables: map[string]any{
			"name":         "test",
			"description":  "abc",
			"workspaceId":  wID.String(),
			"visualizer":   "CESIUM",
			"coreSupport":  true,
			"visibility":   "public",
			"projectAlias": "あいうえお",
		},
	})
	res.Path("$.errors[0].message").IsEqual("Invalid alias name: あいうえお")

	res = Request(e, uID.String(), GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables: map[string]any{
			"name":         "test",
			"description":  "abc",
			"workspaceId":  wID.String(),
			"visualizer":   "CESIUM",
			"coreSupport":  true,
			"visibility":   "public",
			"projectAlias": "test/bad-alias",
		},
	})
	res.Path("$.errors[0].message").IsEqual("Invalid alias name: test/bad-alias")

}

func TestCreateAndGetProject(t *testing.T) {
	e := Server(t, baseSeeder)

	testData(e)
	// GetProjects
	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"workspaceId": wID.String(),
			"pagination": map[string]any{
				"first": 16,
			},
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
		},
	}
	edges := Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()

	edges.Length().IsEqual(2)
	edges.Value(0).Object().Value("node").Object().Value("name").IsEqual("test2-1")

	// check
	for _, edge := range edges.Iter() {
		// coreSupport true only
		edge.Object().Value("node").Object().Value("coreSupport").IsEqual(true)
		// isDeleted false only
		edge.Object().Value("node").Object().Value("isDeleted").IsEqual(false)
		edge.Object().Value("node").Object().Value("metadata").Object().Value("importStatus").IsEqual("NONE")
	}

}

func TestSortByName(t *testing.T) {
	e := Server(t, baseSeeder)

	createProject(e, uID, map[string]any{
		"name":        "a-project",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	createProject(e, uID, map[string]any{
		"name":        "b-project",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	createProject(e, uID, map[string]any{
		"name":        "A-project",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	createProject(e, uID, map[string]any{
		"name":        "B-project",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"last": 5,
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "NAME",
				"direction": "ASC",
			},
		},
	}

	edges := Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()

	edges.Length().IsEqual(5)
	edges.Value(0).Object().Value("node").Object().Value("name").IsEqual("a-project")
	edges.Value(1).Object().Value("node").Object().Value("name").IsEqual("A-project")
	edges.Value(2).Object().Value("node").Object().Value("name").IsEqual("b-project")
	edges.Value(3).Object().Value("node").Object().Value("name").IsEqual("B-project")

}

func TestFindStarredByWorkspace(t *testing.T) {

	e := Server(t, baseSeeder)
	project1ID := createProject(e, uID, map[string]any{
		"name":        "Project 1",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	project2ID := createProject(e, uID, map[string]any{
		"name":        "Project 2",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	project3ID := createProject(e, uID, map[string]any{
		"name":        "Project 3",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	project4ID := createProject(e, uID, map[string]any{
		"name":        "Project 4",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	project5ID := createProject(e, uID, map[string]any{
		"name":        "Project 5",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	updateStarProject(e, project1ID)
	updateStarProject(e, project3ID)

	// star and deleted 'Project 5'
	updateStarProject(e, project5ID)
	deleteProject(e, project5ID)

	requestBody := GraphQLRequest{
		OperationName: "GetStarredProjects",
		Query: `
		query GetStarredProjects($workspaceId: ID!) {
			starredProjects(workspaceId: $workspaceId) {
				nodes {
					id
					name
					starred
					isDeleted
				}
				totalCount
			}
		}`,
		Variables: map[string]any{
			"workspaceId": wID,
		},
	}

	starredProjects := Request(e, uID.String(), requestBody).
		Path("$.data.starredProjects").Object()

	totalCount := starredProjects.Value("totalCount").Raw()
	assert.Equal(t, float64(2), totalCount, "Expected 2 starred projects")

	nodes := starredProjects.Value("nodes").Array()
	nodeCount := int(nodes.Length().Raw())
	assert.Equal(t, 2, nodeCount, "Expected 2 nodes in the response")

	nodes.Length().IsEqual(2) // 'Project 1' and 'Project 3'

	starredProjectsMap := make(map[string]bool)
	for _, node := range nodes.Iter() {
		obj := node.Object()
		id := obj.Value("id").String().Raw()
		name := obj.Value("name").String().Raw()
		starred := obj.Value("starred").Boolean().Raw()

		starredProjectsMap[id] = true

		if id == project1ID {
			assert.Equal(t, "Project 1", name)
			assert.True(t, starred)
		} else if id == project3ID {
			assert.Equal(t, "Project 3", name)
			assert.True(t, starred)
		} else {
			t.Errorf("Unexpected project in starred projects: %s", id)
		}
	}

	assert.True(t, starredProjectsMap[project1ID], "Project 1 should be starred")
	assert.True(t, starredProjectsMap[project3ID], "Project 3 should be starred")
	assert.False(t, starredProjectsMap[project2ID], "Project 2 should not be starred")
	assert.False(t, starredProjectsMap[project4ID], "Project 4 should not be starred")
}

func updateStarProject(e *httpexpect.Expect, projectID string) {
	response := updateProject(e, uID, map[string]any{
		"input": map[string]any{
			"projectId": projectID,
			"starred":   true,
		},
	}).Object()

	response.HasValue("id", projectID).
		HasValue("starred", true)
}

// go test -v -run TestFindVisibilityProjects ./e2e/...
func TestFindVisibilityProjects(t *testing.T) {
	e := Server(t, baseSeeder)
	project1ID := createProject(e, uID, map[string]any{
		"name":        "Project 1",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"last": 5,
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "NAME",
				"direction": "ASC",
			},
		},
	}

	// default private
	edges := Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()
	edges.Value(1).Path("$.node.visibility").IsEqual("private")

	// update public
	updateVisibilityProject(e, project1ID)

	// result public
	edges = Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()
	edges.Value(1).Path("$.node.visibility").IsEqual("public")

	// create public
	createProject(e, uID, map[string]any{
		"name":        "Project 1",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "public",
	})
	edges = Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()
	edges.Value(2).Path("$.node.visibility").IsEqual("public")

}

func updateVisibilityProject(e *httpexpect.Expect, projectID string) {
	response := updateProject(e, uID, map[string]any{
		"input": map[string]any{
			"projectId":  projectID,
			"visibility": "public",
		},
	}).Object()

	response.HasValue("id", projectID).
		HasValue("visibility", "public")
}

func TestSortByUpdatedAt(t *testing.T) {

	e := Server(t, baseSeeder)

	createProject(e, uID, map[string]any{
		"name":        "project1-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	project2ID := createProject(e, uID, map[string]any{
		"name":        "project2-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	createProject(e, uID, map[string]any{
		"name":        "project3-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	// Update 'project2'
	updateProject(e, uID, map[string]any{
		"input": map[string]any{
			"projectId":   project2ID,
			"description": "test updaet",
		},
	}).Object()

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"first": 3, // Get first 3 itme
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC", // Sort DESC by UPDATEDAT
			},
		},
	}

	edges := Request(e, uID.String(), requestBody).
		Path("$.data.projects.edges").Array()

	edges.Length().IsEqual(3)
	edges.Value(0).Object().Value("node").Object().Value("name").IsEqual("project2-test") // 'project2' is first
}

func TestDeleteProjects(t *testing.T) {

	e := Server(t, baseSeeder)

	testData(e)

	// check
	requestBody := GraphQLRequest{
		OperationName: "GetDeletedProjects",
		Query: `
			query GetDeletedProjects($workspaceId: ID!) {
				deletedProjects(workspaceId: $workspaceId) {
					nodes {
						id
						name
						isDeleted
						coreSupport
					}
					totalCount
				}
			}`,
		Variables: map[string]any{
			"workspaceId": wID,
		},
	}

	nodes := Request(e, uID.String(), requestBody).
		Path("$.data.deletedProjects.nodes").Array()

	nodes.Length().IsEqual(1)
	nodes.Value(0).Object().Value("name").IsEqual("test2-2")

	// check
	for _, node := range nodes.Iter() {
		// coreSupport true only
		node.Object().Value("coreSupport").IsEqual(true)
		// isDeleted true only
		node.Object().Value("isDeleted").IsEqual(true)
	}
}

func deleteProject(e *httpexpect.Expect, projectID string) {
	response := updateProject(e, uID, map[string]any{
		"input": map[string]any{
			"projectId": projectID,
			"deleted":   true,
		},
	}).Object()

	response.HasValue("id", projectID).
		HasValue("isDeleted", true)
}

func testData(e *httpexpect.Expect) {

	// create coreSupport default(=false) project
	createProject2(e, uID, map[string]any{
		"name":        "test1-1",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
	}).Object().
		HasValue("name", "test1-1").
		HasValue("coreSupport", false).   //default(=false)
		HasValue("visibility", "private") //default(=private)

	// create coreSupport default(=false) visibility default(=private) `delete` project
	id := createProject2(e, uID, map[string]any{
		"name":        "test1-2",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
	}).Object().
		HasValue("name", "test1-2").
		HasValue("coreSupport", false).    //default(=false)
		HasValue("visibility", "private"). //default(=private)
		Value("id").Raw().(string)

	deleteProject(e, id) // delete

	// create coreSupport:true visibility:public
	createProject2(e, uID, map[string]any{
		"name":        "test2-1",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "public",
	}).Object().
		HasValue("name", "test2-1").
		HasValue("coreSupport", true).
		HasValue("visibility", "public")

	// create coreSupport:true visibility:public `delete`
	id = createProject2(e, uID, map[string]any{
		"name":        "test2-2",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
		"visibility":  "public",
	}).Object().
		HasValue("name", "test2-2").
		HasValue("coreSupport", true).
		HasValue("visibility", "public").
		Value("id").Raw().(string)

	deleteProject(e, id) // delete

	// create coreSupport:false visibility:private
	createProject2(e, uID, map[string]any{
		"name":        "test3-1",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": false,
		"visibility":  "private",
	}).Object().
		HasValue("name", "test3-1").
		HasValue("coreSupport", false).
		HasValue("visibility", "private")

	// create coreSupport:false visibility:private `delete`
	id = createProject2(e, uID, map[string]any{
		"name":        "test3-2",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": false,
		"visibility":  "private",
	}).Object().
		HasValue("name", "test3-2").
		HasValue("coreSupport", false).
		HasValue("visibility", "private").
		Value("id").Raw().(string)

	deleteProject(e, id) // delete
}

func projects(t *testing.T, ctx context.Context, r *repo.Container, count int, wID idx.ID[accountdomain.Workspace], name string, alias string, coreSupport bool) {
	for i := range make([]int, count) {
		p := project.New().
			ID(id.NewProjectID()).
			Name(fmt.Sprintf(name+" name%d", i+1)).
			Description(fmt.Sprintf(name+" description%d", i+1)).
			ImageURL(lo.Must(url.Parse("https://test.com"))).
			Workspace(wID).
			Alias(alias).
			IsArchived(false).
			Deleted(false).
			CoreSupport(coreSupport).
			MustBuild()
		err := r.Project.Save(ctx, p)
		assert.Nil(t, err)
	}
}

func projectsOldData(t *testing.T, ctx context.Context, r *repo.Container, count int, wID idx.ID[accountdomain.Workspace], name string, alias string) {
	for i := range make([]int, count) {
		p := project.New().
			ID(id.NewProjectID()).
			Name(fmt.Sprintf(name+" name%d", i+1)).
			Description(fmt.Sprintf(name+" description%d", i+1)).
			ImageURL(lo.Must(url.Parse("https://test.com"))).
			Workspace(wID).
			Alias(alias).
			IsArchived(false).
			// Deleted(false). not exist
			// CoreSupport(true). not exist
			MustBuild()
		err := r.Project.Save(ctx, p)
		assert.Nil(t, err)
	}
}

func TestGetProjectPagination(t *testing.T) {
	e, r, _ := ServerAndRepos(t, baseSeeder)
	ctx := context.Background()

	projects(t, ctx, r, 20, wID, "[wID]project", "ALIAS1", true)
	projects(t, ctx, r, 20, wId1, "[wId1]project", "ALIAS2", true)

	// ===== First request
	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"first": 16,
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			// "keyword": "Project",
		},
	}

	projects := Request(e, uID.String(), requestBody).
		Path("$.data.projects").Object()

	projects.HasValue("totalCount", 21)

	edges := projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 16)
	for _, v := range edges {
		//Only the same workspaceId
		v.Object().Value("node").Object().HasValue("workspaceId", wID.String())
	}

	pageInfo := projects.Value("pageInfo").Object()
	pageInfo.HasValue("hasNextPage", true)

	// ===== Second request
	endCursor := pageInfo.Value("endCursor").Raw().(string)

	requestBody = GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"after": endCursor,
				"first": 16,
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			// "keyword": "Project",
		},
	}
	projects = Request(e, uID.String(), requestBody).
		Path("$.data.projects").Object()

	projects.HasValue("totalCount", 5)

	edges = projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 5)
	for _, v := range edges {
		//Only the same workspaceId
		v.Object().Value("node").Object().HasValue("workspaceId", wID.String())
	}

	pageInfo = projects.Value("pageInfo").Object()
	pageInfo.HasValue("hasNextPage", false)

}

func TestGetProjectPaginationKeyword(t *testing.T) {
	e, r, _ := ServerAndRepos(t, baseSeeder)
	ctx := context.Background()

	// no match data
	projects(t, ctx, r, 10, wID, "AAAAAAA", "ALIAS1", true)
	projects(t, ctx, r, 10, wID, "BBBBBBB", "ALIAS2", true)

	// match data
	projects(t, ctx, r, 10, wID, "AAAProjectAAAA", "ALIAS3", true)
	projects(t, ctx, r, 10, wID, "BBBProjectBBBB", "ALIAS4", true)

	// no match data
	projects(t, ctx, r, 10, wID, "AAAProjectAAAA", "ALIAS5", false)
	projectsOldData(t, ctx, r, 10, wID, "BBBProjectBBBB", "ALIAS6")

	// ===== First request
	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"first": 16,
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			"keyword": "Project",
		},
	}

	projects := Request(e, uID.String(), requestBody).
		Path("$.data.projects").Object()

	projects.HasValue("totalCount", 20)

	edges := projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 16)
	for _, v := range edges {
		//Only the same workspaceId
		v.Object().Value("node").Object().HasValue("workspaceId", wID.String())
	}

	pageInfo := projects.Value("pageInfo").Object()
	pageInfo.HasValue("hasNextPage", true)

	// ===== Second request
	endCursor := pageInfo.Value("endCursor").Raw().(string)

	requestBody = GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"after": endCursor,
				"first": 16,
			},
			"workspaceId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			"keyword": "Project",
		},
	}
	projects = Request(e, uID.String(), requestBody).
		Path("$.data.projects").Object()

	projects.HasValue("totalCount", 4)

	edges = projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 4)
	for _, v := range edges {
		//Only the same workspaceId
		v.Object().Value("node").Object().HasValue("workspaceId", wID.String())
	}

	pageInfo = projects.Value("pageInfo").Object()
	pageInfo.HasValue("hasNextPage", false)

}

func TestProjectVisibility(t *testing.T) {
	e := Server(t, baseSeeder)

	createProject(e, uID, map[string]any{
		"name":        "project1-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	createProject(e, uID, map[string]any{
		"name":        "project2-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	createProject(e, uID, map[string]any{
		"name":        "project3-test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
}
