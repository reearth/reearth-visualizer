package e2e

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestCreateAndGetProject(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	testData(e)

	// GetProjects
	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         "query GetProjects($teamId: ID!, $pagination: Pagination, $keyword: String, $sort: ProjectSort) {\n projects(\n teamId: $teamId\n pagination: $pagination\n keyword: $keyword\n sort: $sort\n ) {\n edges {\n node {\n id\n ...ProjectFragment\n scene {\n id\n __typename\n }\n __typename\n }\n __typename\n }\n nodes {\n id\n ...ProjectFragment\n scene {\n id\n __typename\n }\n __typename\n }\n pageInfo {\n endCursor\n hasNextPage\n hasPreviousPage\n startCursor\n __typename\n }\n totalCount\n __typename\n }\n}\n\nfragment ProjectFragment on Project {\n id\n name\n description\n imageUrl\n isArchived\n isBasicAuthActive\n basicAuthUsername\n basicAuthPassword\n publicTitle\n publicDescription\n publicImage\n alias\n enableGa\n trackingId\n publishmentStatus\n updatedAt\n createdAt\n coreSupport\n starred\n isDeleted\n __typename\n}",
		Variables: map[string]any{
			"teamId": wID.String(),
			"pagination": map[string]any{
				"first": 16,
			},
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
		},
	}
	edges := callRequest(e, requestBody).
		Value("projects").Object().
		Value("edges").Array()

	edges.Length().Equal(1)
	edges.First().Object().Value("node").Object().Value("name").Equal("test2-1")

	// check
	for _, edge := range edges.Iter() {
		// coreSupport true only
		edge.Object().Value("node").Object().Value("coreSupport").Equal(true)
		// isDeleted false only
		edge.Object().Value("node").Object().Value("isDeleted").Equal(false)
	}

}

func TestSortByName(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	createProject(e, "a-project")
	createProject(e, "b-project")
	createProject(e, "A-project")
	createProject(e, "B-project")

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query: `
		query GetProjects($teamId: ID!, $pagination: Pagination, $keyword: String, $sort: ProjectSort) {
			projects(
				teamId: $teamId
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

		fragment ProjectFragment on Project {
			id
			name
			description
			imageUrl
			isArchived
			isBasicAuthActive
			basicAuthUsername
			basicAuthPassword
			publicTitle
			publicDescription
			publicImage
			alias
			enableGa
			trackingId
			publishmentStatus
			updatedAt
			createdAt
			coreSupport
			starred
			__typename
		}`,
		Variables: map[string]any{
			"pagination": map[string]any{
				"last": 5,
			},
			"teamId": wID.String(),
			"sort": map[string]string{
				"field":     "NAME",
				"direction": "ASC",
			},
		},
	}

	edges := callRequest(e, requestBody).
		Value("projects").Object().
		Value("edges").Array()

	edges.Length().Equal(4)
	edges.Element(0).Object().Value("node").Object().Value("name").Equal("a-project")
	edges.Element(1).Object().Value("node").Object().Value("name").Equal("A-project")
	edges.Element(2).Object().Value("node").Object().Value("name").Equal("b-project")
	edges.Element(3).Object().Value("node").Object().Value("name").Equal("B-project")

}

func TestFindStarredByWorkspace(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)
	project1ID := createProject(e, "Project 1")
	project2ID := createProject(e, "Project 2")
	project3ID := createProject(e, "Project 3")
	project4ID := createProject(e, "Project 4")
	project5ID := createProject(e, "Project 5")

	starProject(e, project1ID)
	starProject(e, project3ID)

	// star and deleted 'Project 5'
	starProject(e, project5ID)
	deleteProject(e, project5ID)

	requestBody := GraphQLRequest{
		OperationName: "GetStarredProjects",
		Query: `
		query GetStarredProjects($teamId: ID!) {
			starredProjects(teamId: $teamId) {
				nodes {
					id
					name
					starred
				}
				totalCount
			}
		}`,
		Variables: map[string]any{
			"teamId": wID,
		},
	}

	starredProjects := callRequest(e, requestBody).
		Value("starredProjects").Object()

	totalCount := starredProjects.Value("totalCount").Raw()
	assert.Equal(t, float64(2), totalCount, "Expected 2 starred projects")

	nodes := starredProjects.Value("nodes").Array()
	nodeCount := int(nodes.Length().Raw())
	assert.Equal(t, 2, nodeCount, "Expected 2 nodes in the response")

	nodes.Length().Equal(2) // 'Project 1' and 'Project 3'

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

func starProject(e *httpexpect.Expect, projectID string) {
	updateProjectMutation := GraphQLRequest{
		OperationName: "UpdateProject",
		Query: `
		mutation UpdateProject($projectId: ID!, $starred: Boolean!) {
			updateProject(input: {projectId: $projectId, starred: $starred}) {
				project {
					id
					starred
				}
			}
		}`,
		Variables: map[string]any{
			"projectId": projectID,
			"starred":   true,
		},
	}

	response := callRequest(e, updateProjectMutation).
		Value("updateProject").Object().
		Value("project").Object()

	response.ValueEqual("id", projectID).
		ValueEqual("starred", true)
}

const GetProjectsQuery = `
query GetProjects($teamId: ID!, $pagination: Pagination, $keyword: String, $sort: ProjectSort) {
  projects(
    teamId: $teamId
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
fragment ProjectFragment on Project {
  id
  teamId
  name
  description
  imageUrl
  isArchived
  isBasicAuthActive
  basicAuthUsername
  basicAuthPassword
  publicTitle
  publicDescription
  publicImage
  alias
  enableGa
  trackingId
  publishmentStatus
  updatedAt
  createdAt
  coreSupport
  starred
  isDeleted
  __typename
}`

func TestSortByUpdatedAt(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	createProject(e, "project1-test")
	project2ID := createProject(e, "project2-test")
	createProject(e, "project3-test")

	updateProjectMutation := GraphQLRequest{
		OperationName: "UpdateProject",
		Query: `mutation UpdateProject($input: UpdateProjectInput!) {
			updateProject(input: $input) {
				project {
					id
					name
					description
					updatedAt
					__typename
				}
				__typename
			}
		}`,
		Variables: map[string]any{
			"input": map[string]any{
				"projectId":   project2ID,
				"description": "test updaet",
			},
		},
	}

	// Update 'project2'
	callRequest(e, updateProjectMutation).
		Value("updateProject").Object().
		Value("project").Object()

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"pagination": map[string]any{
				"first": 3, // Get first 3 itme
			},
			"teamId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC", // Sort DESC by UPDATEDAT
			},
		},
	}

	edges := callRequest(e, requestBody).
		Value("projects").Object().
		Value("edges").Array()

	edges.Length().Equal(3)
	edges.Element(0).Object().Value("node").Object().Value("name").Equal("project2-test") // 'project2' is first
}

func TestDeleteProjects(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	testData(e)

	// check
	requestBody := GraphQLRequest{
		OperationName: "GetDeletedProjects",
		Query: `
			query GetDeletedProjects($teamId: ID!) {
				deletedProjects(teamId: $teamId) {
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
			"teamId": wID,
		},
	}
	nodes := callRequest(e, requestBody).
		Value("deletedProjects").Object().
		Value("nodes").Array()

	nodes.Length().Equal(1)
	nodes.First().Object().Value("name").Equal("test2-2")

	// check
	for _, node := range nodes.Iter() {
		// coreSupport true only
		node.Object().Value("coreSupport").Equal(true)
		// isDeleted true only
		node.Object().Value("isDeleted").Equal(true)
	}
}

func deleteProject(e *httpexpect.Expect, projectID string) {

	updateProjectMutation := GraphQLRequest{
		OperationName: "UpdateProject",
		Query: `mutation UpdateProject($input: UpdateProjectInput!) {
			updateProject(input: $input) {
				project {
					id
					name
					isDeleted
					updatedAt
					__typename
				}
				__typename
			}
		}`,
		Variables: map[string]any{
			"input": map[string]any{
				"projectId": projectID,
				"deleted":   true,
			},
		},
	}

	response := callRequest(e, updateProjectMutation).
		Value("updateProject").Object().
		Value("project").Object()

	response.ValueEqual("id", projectID).
		ValueEqual("isDeleted", true)
}

func createGraphQLRequest(name string, coreSupport bool) GraphQLRequest {
	return GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL, $coreSupport: Boolean) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl, coreSupport: $coreSupport}\n ) {\n project {\n id\n name\n description\n imageUrl\n coreSupport\n __typename\n }\n __typename\n }\n}",
		Variables: map[string]any{
			"name":        name,
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": coreSupport,
		},
	}
}

func callRequest(e *httpexpect.Expect, requestBody GraphQLRequest) *httpexpect.Object {
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object()
}

func testData(e *httpexpect.Expect) {

	// create coreSupport default(=false) project
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl}\n ) {\n project {\n id\n name\n description\n imageUrl\n coreSupport\n __typename\n }\n __typename\n }\n}",
		Variables: map[string]any{
			"name":        "test1-1",
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
		},
	}
	callRequest(e, requestBody).Value("createProject").Object().Value("project").Object().
		ValueEqual("name", "test1-1").
		ValueEqual("coreSupport", false)

	// create coreSupport default(=false) `delete` project
	requestBody = GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl}\n ) {\n project {\n id\n name\n description\n imageUrl\n coreSupport\n __typename\n }\n __typename\n }\n}",
		Variables: map[string]any{
			"name":        "test1-2",
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
		},
	}
	id := callRequest(e, requestBody).Value("createProject").Object().Value("project").Object().
		ValueEqual("name", "test1-2").
		ValueEqual("coreSupport", false).
		Value("id").Raw().(string)
	deleteProject(e, id) // delete

	// create coreSupport:true project
	requestBody = createGraphQLRequest("test2-1", true)
	callRequest(e, requestBody).Value("createProject").Object().Value("project").Object().
		ValueEqual("name", "test2-1").
		ValueEqual("coreSupport", true)

	// create coreSupport:true `delete` project
	requestBody = createGraphQLRequest("test2-2", true)
	id = callRequest(e, requestBody).Value("createProject").Object().Value("project").Object().
		ValueEqual("name", "test2-2").
		ValueEqual("coreSupport", true).
		Value("id").Raw().(string)
	deleteProject(e, id) // delete

	// create coreSupport:false project
	requestBody = createGraphQLRequest("test3-1", false)
	callRequest(e, requestBody).Value("createProject").Object().Value("project").Object().
		ValueEqual("name", "test3-1").
		ValueEqual("coreSupport", false)

	// create coreSupport:false `delete` project
	requestBody = createGraphQLRequest("test3-2", false)
	id = callRequest(e, requestBody).Value("createProject").Object().Value("project").Object().
		ValueEqual("name", "test3-2").
		ValueEqual("coreSupport", false).
		Value("id").Raw().(string)
	deleteProject(e, id) // delete
}

func projects(t *testing.T, ctx context.Context, r *repo.Container, count int, wID idx.ID[accountdomain.Workspace], name string, alias string, coreSupport bool) {
	for i := range make([]int, count) {
		p := project.New().
			ID(project.NewID()).
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
			ID(project.NewID()).
			Name(fmt.Sprintf(name+" name%d", i+1)).
			Description(fmt.Sprintf(name+" description%d", i+1)).
			ImageURL(lo.Must(url.Parse("https://test.com"))).
			Workspace(wID).
			Alias(alias).
			IsArchived(false).
			// Deleted(false).      not exist
			// CoreSupport(true).   not exist
			MustBuild()
		err := r.Project.Save(ctx, p)
		assert.Nil(t, err)
	}
}

func TestGetProjectPagination(t *testing.T) {
	c := &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}
	e, r, _ := StartServerAndRepos(t, c, true, baseSeeder)
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
			"teamId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			// "keyword": "Project",
		},
	}

	projects := Request(e, uID.String(), requestBody).Object().Value("data").Object().Value("projects").Object()

	projects.ValueEqual("totalCount", 20)

	edges := projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 16)
	for _, v := range edges {
		//Only the same teamId
		v.Object().Value("node").Object().ValueEqual("teamId", wID.String())
	}

	pageInfo := projects.Value("pageInfo").Object()
	pageInfo.ValueEqual("hasNextPage", true)

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
			"teamId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			// "keyword": "Project",
		},
	}
	projects = Request(e, uID.String(), requestBody).Object().Value("data").Object().Value("projects").Object()
	projects.ValueEqual("totalCount", 4)

	edges = projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 4)
	for _, v := range edges {
		//Only the same teamId
		v.Object().Value("node").Object().ValueEqual("teamId", wID.String())
	}

	pageInfo = projects.Value("pageInfo").Object()
	pageInfo.ValueEqual("hasNextPage", false)

}

func TestGetProjectPaginationKeyword(t *testing.T) {
	c := &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}
	e, r, _ := StartServerAndRepos(t, c, true, baseSeeder)
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
			"teamId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			"keyword": "Project",
		},
	}

	projects := Request(e, uID.String(), requestBody).Object().Value("data").Object().Value("projects").Object()

	projects.ValueEqual("totalCount", 20)

	edges := projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 16)
	for _, v := range edges {
		//Only the same teamId
		v.Object().Value("node").Object().ValueEqual("teamId", wID.String())
	}

	pageInfo := projects.Value("pageInfo").Object()
	pageInfo.ValueEqual("hasNextPage", true)

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
			"teamId": wID.String(),
			"sort": map[string]string{
				"field":     "UPDATEDAT",
				"direction": "DESC",
			},
			"keyword": "Project",
		},
	}
	projects = Request(e, uID.String(), requestBody).Object().Value("data").Object().Value("projects").Object()
	projects.ValueEqual("totalCount", 4)

	edges = projects.Value("edges").Array().Iter()
	assert.Equal(t, len(edges), 4)
	for _, v := range edges {
		//Only the same teamId
		v.Object().Value("node").Object().ValueEqual("teamId", wID.String())
	}

	pageInfo = projects.Value("pageInfo").Object()
	pageInfo.ValueEqual("hasNextPage", false)

}
