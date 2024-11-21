package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
)

func TestCreateProject(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	},
		true, baseSeeder)

	// create project with default core value (false)
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl}\n ) {\n project {\n id\n name\n description\n imageUrl\n core\n __typename\n }\n __typename\n }\n}",
		Variables: map[string]any{
			"name":        "test",
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
		},
	}

	e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		// WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object().
		// ValueEqual("id", pId.String()).
		ValueEqual("name", "test").
		ValueEqual("description", "abc").
		ValueEqual("imageUrl", "").
		ValueEqual("core", false)

	// create core project
	requestBody = GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL, $core: Boolean) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl, core: $core}\n ) {\n project {\n id\n name\n description\n imageUrl\n core\n __typename\n }\n __typename\n }\n}",
		Variables: map[string]any{
			"name":        "test",
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"core":        true,
		},
	}

	e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		// WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object().
		// ValueEqual("id", pId.String()).
		ValueEqual("name", "test").
		ValueEqual("description", "abc").
		ValueEqual("imageUrl", "").
		ValueEqual("core", true)
}

func TestSortByName(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	},
		true, baseSeeder)

	createProject(e, "a-project")
	createProject(e, "b-project")
	createProject(e, "A-project")
	createProject(e, "B-project")
	seedProjectName := pName

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
			core
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

	edges := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("projects").Object().
		Value("edges").Array()

	edges.Length().Equal(5)
	edges.Element(0).Object().Value("node").Object().Value("name").Equal("a-project")
	edges.Element(1).Object().Value("node").Object().Value("name").Equal("A-project")
	edges.Element(2).Object().Value("node").Object().Value("name").Equal("b-project")
	edges.Element(3).Object().Value("node").Object().Value("name").Equal("B-project")
	edges.Element(4).Object().Value("node").Object().Value("name").Equal(seedProjectName)
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

	response := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	starredProjects := response.Value("data").Object().Value("starredProjects").Object()

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

	response := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(updateProjectMutation).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("updateProject").Object().
		Value("project").Object()

	response.ValueEqual("id", projectID).
		ValueEqual("starred", true)
}

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

	requestBody := GraphQLRequest{
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
	e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	requestBody = GraphQLRequest{
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
			core
			starred
			__typename
		}`,
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

	edges := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("projects").Object().
		Value("edges").Array()

	edges.Length().Equal(3)
	edges.Element(0).Object().Value("node").Object().Value("name").Equal("project2-test") // 'project2' is first
}

//  go test -v -run TestDeleteProjects ./e2e/...

func TestDeleteProjects(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	createProject(e, "project1-test")
	project2ID := createProject(e, "project2-test")
	createProject(e, "project3-test")

	// Deleted 'project2'
	deleteProject(e, project2ID)

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
					}
					totalCount
				}
			}`,
		Variables: map[string]any{
			"teamId": wID,
		},
	}
	deletedProjects := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Value("data").Object().Value("deletedProjects").Object()

	deletedProjects.Value("totalCount").Equal(1)
	deletedProjects.Value("nodes").Array().Length().Equal(1)
	deletedProjects.Value("nodes").Array().First().Object().Value("name").Equal("project2-test")
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

	response := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(updateProjectMutation).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("data").Object().
		Value("updateProject").Object().
		Value("project").Object()

	response.ValueEqual("id", projectID).
		ValueEqual("isDeleted", true)
}
