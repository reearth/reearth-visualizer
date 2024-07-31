package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
)

func TestCreateProject(t *testing.T) {
	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	},
		true, baseSeeder)

	// create project with default coreSupport value (false)
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl}\n ) {\n project {\n id\n name\n description\n imageUrl\n coreSupport\n __typename\n }\n __typename\n }\n}",
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
		ValueEqual("coreSupport", false)

	// create coreSupport project
	requestBody = GraphQLRequest{
		OperationName: "CreateProject",
		Query:         "mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL, $coreSupport: Boolean) {\n createProject(\n input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl, coreSupport: $coreSupport}\n ) {\n project {\n id\n name\n description\n imageUrl\n coreSupport\n __typename\n }\n __typename\n }\n}",
		Variables: map[string]any{
			"name":        "test",
			"description": "abc",
			"imageUrl":    "",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
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
		ValueEqual("coreSupport", true)
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
		Query:         "query GetProjects($teamId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor, $keyword: String, $sort: ProjectSortType) {\n projects(\n teamId: $teamId\n first: $first\n last: $last\n after: $after\n before: $before\n keyword: $keyword\n sort: $sort\n ) {\n edges {\n node {\n id\n ...ProjectFragment\n scene {\n id\n __typename\n }\n __typename\n }\n __typename\n }\n nodes {\n id\n ...ProjectFragment\n scene {\n id\n __typename\n }\n __typename\n }\n pageInfo {\n endCursor\n hasNextPage\n hasPreviousPage\n startCursor\n __typename\n }\n totalCount\n __typename\n }\n}\n\nfragment ProjectFragment on Project {\n id\n name\n description\n imageUrl\n isArchived\n isBasicAuthActive\n basicAuthUsername\n basicAuthPassword\n publicTitle\n publicDescription\n publicImage\n alias\n enableGa\n trackingId\n publishmentStatus\n updatedAt\n createdAt\n coreSupport\n starred\n __typename\n}",
		Variables: map[string]any{
			"last":   5,
			"teamId": wID.String(),
			"sort":   "NAME",
		},
	}

	edges := e.POST("/api/graphql").
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
		Value("projects").Object().
		Value("edges").Array()

	edges.Length().Equal(5)
	edges.Element(0).Object().Value("node").Object().Value("name").Equal("a-project")
	edges.Element(1).Object().Value("node").Object().Value("name").Equal("A-project")
	edges.Element(2).Object().Value("node").Object().Value("name").Equal("b-project")
	edges.Element(3).Object().Value("node").Object().Value("name").Equal("B-project")
	edges.Element(4).Object().Value("node").Object().Value("name").Equal(seedProjectName)
}
