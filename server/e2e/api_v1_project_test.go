package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/stretchr/testify/require"
)

var publicApiConfig = &config.Config{
	Dev:      true,
	MockAuth: true,
	Visualizer: config.VisualizerConfig{
		PublicApi: config.PublicApiConfig{Active: true},
	},
}

func startPublicAPI(t *testing.T) *httpexpect.Expect {
	t.Helper()
	e, _, _ := startServer(t, publicApiConfig, true, baseSeeder)
	return e
}

// apiV1 sends requests to /api/v1 as the given user ("" for none).
func apiV1(e *httpexpect.Expect, method, path string, user accountsID.UserID) *httpexpect.Request {
	req := e.Request(method, "/api/v1"+path)
	if !user.IsEmpty() {
		req = req.WithHeader("X-Reearth-Debug-User", user.String())
	}
	return req
}

func expectAPIError(t *testing.T, r *httpexpect.Response, status int, code string) {
	t.Helper()
	r.Status(status).JSON().Object().Value("error").Object().HasValue("code", code)
}

func TestAPIV1ServesOnlyTheAPI(t *testing.T) {
	e := startPublicAPI(t)

	e.GET("/api/ping").Expect().Status(http.StatusOK)
	// The main server's routes are not part of this service.
	e.POST("/api/graphql").WithJSON(map[string]any{"query": "{ me { id } }"}).
		WithHeader("X-Reearth-Debug-User", uID.String()).
		Expect().Status(http.StatusNotFound)
}

func TestAPIV1RequiresAUser(t *testing.T) {
	e := startPublicAPI(t)

	expectAPIError(t, apiV1(e, http.MethodGet, "/workspaces/"+wID.String()+"/projects", accountsID.UserID{}).Expect(),
		http.StatusUnauthorized, "unauthorized")
}

func TestAPIV1ListProjects(t *testing.T) {
	e := startPublicAPI(t)
	path := "/workspaces/" + wID.String() + "/projects"

	list := apiV1(e, http.MethodGet, path, uID).Expect().Status(http.StatusOK).JSON().Object()
	list.Value("totalCount").Number().IsEqual(1)
	list.Value("items").Array().Value(0).Object().HasValue("id", pID.String())
	list.NotContainsKey("nextCursor")

	// Another user's workspace looks empty, with any filter.
	for _, q := range []string{"", "starred", "deleted"} {
		req := apiV1(e, http.MethodGet, path, uID2)
		if q != "" {
			req = req.WithQuery(q, true)
		}
		req.Expect().Status(http.StatusOK).JSON().Object().Value("items").Array().IsEmpty()
	}

	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).WithQuery("limit", 0).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).WithQuery("limit", 101).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).WithQuery("sort", "size").Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).
		WithQuery("starred", true).WithQuery("deleted", true).Expect(),
		http.StatusBadRequest, "invalid_input")
	for _, filter := range []string{"starred", "deleted"} {
		expectAPIError(t, apiV1(e, http.MethodGet, path, uID).
			WithQuery(filter, true).WithQuery("keyword", "map").Expect(),
			http.StatusBadRequest, "invalid_input")
		expectAPIError(t, apiV1(e, http.MethodGet, path, uID).
			WithQuery(filter, true).WithQuery("sort", "name").Expect(),
			http.StatusBadRequest, "invalid_input")
	}
}

func TestAPIV1ListProjectsPagination(t *testing.T) {
	e, r, _ := startServer(t, publicApiConfig, true, baseSeeder)
	path := "/workspaces/" + wID.String() + "/projects"
	for _, name := range []string{"a", "b", "c"} {
		p := project.New().NewID().Workspace(wID).Name(name).
			Visualizer(visualizer.VisualizerCesium).CoreSupport(true).MustBuild()
		require.NoError(t, r.Project.Save(t.Context(), p))
	}

	seen := map[string]bool{}
	var cursor string
	for page := 0; ; page++ {
		if page > 3 {
			t.Fatal("pagination did not end")
		}
		req := apiV1(e, http.MethodGet, path, uID).WithQuery("limit", 3)
		if cursor != "" {
			req = req.WithQuery("cursor", cursor)
		}
		list := req.Expect().Status(http.StatusOK).JSON().Object()
		if page == 0 {
			list.Value("totalCount").Number().IsEqual(4)
		}
		for _, item := range list.Value("items").Array().Iter() {
			seen[item.Object().Value("id").String().Raw()] = true
		}
		next, ok := list.Raw()["nextCursor"].(string)
		if !ok {
			break
		}
		cursor = next
	}
	if len(seen) != 4 {
		t.Fatalf("saw %d projects across pages, want 4", len(seen))
	}
}
