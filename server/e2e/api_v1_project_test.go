package e2e

import (
	"net/http"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
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

	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/"+pID.String(), accountsID.UserID{}).Expect(),
		http.StatusUnauthorized, "unauthorized")
}

func TestAPIV1GetProject(t *testing.T) {
	e := startPublicAPI(t)

	p := apiV1(e, http.MethodGet, "/projects/"+pID.String(), uID).Expect().
		Status(http.StatusOK).JSON().Object()
	p.HasValue("id", pID.String())
	p.HasValue("workspaceId", wID.String())
	p.HasValue("name", pName)
	p.HasValue("deleted", false)
	p.Value("createdAt").String().HasSuffix("Z")
	p.Value("updatedAt").String().HasSuffix("Z")
	p.NotContainsKey("basicAuthPassword")

	// A reader of the workspace can see it.
	apiV1(e, http.MethodGet, "/projects/"+pID.String(), uID3).Expect().Status(http.StatusOK)

	// Someone outside the workspace gets 404, not 403, so IDs do not leak.
	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/"+pID.String(), uID2).Expect(),
		http.StatusNotFound, "not_found")

	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/not-an-id", uID).Expect(),
		http.StatusBadRequest, "invalid_input")
}

func TestAPIV1ListProjects(t *testing.T) {
	e := startPublicAPI(t)
	path := "/workspaces/" + wID.String() + "/projects"

	list := apiV1(e, http.MethodGet, path, uID).Expect().Status(http.StatusOK).JSON().Object()
	list.Value("totalCount").Number().IsEqual(1)
	list.Value("items").Array().Value(0).Object().HasValue("id", pID.String())
	list.NotContainsKey("nextCursor")

	// Another user's workspace looks empty.
	apiV1(e, http.MethodGet, path, uID2).Expect().Status(http.StatusOK).
		JSON().Object().Value("items").Array().IsEmpty()

	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).WithQuery("limit", 0).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).WithQuery("limit", 101).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).WithQuery("sort", "size").Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).
		WithQuery("starred", true).WithQuery("deleted", true).Expect(),
		http.StatusBadRequest, "invalid_input")
}

func TestAPIV1ListProjectsPagination(t *testing.T) {
	e := startPublicAPI(t)
	path := "/workspaces/" + wID.String() + "/projects"
	for _, name := range []string{"a", "b", "c"} {
		apiV1(e, http.MethodPost, path, uID).WithJSON(map[string]any{"name": name}).
			Expect().Status(http.StatusCreated)
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

func TestAPIV1CreateProject(t *testing.T) {
	e := startPublicAPI(t)
	path := "/workspaces/" + wID.String() + "/projects"

	p := apiV1(e, http.MethodPost, path, uID).
		WithJSON(map[string]any{"name": "from cli", "description": "desc"}).
		Expect().Status(http.StatusCreated).JSON().Object()
	p.HasValue("name", "from cli")
	p.HasValue("description", "desc")
	p.HasValue("workspaceId", wID.String())
	p.HasValue("visibility", "private")
	// The scene is created with the project, so plugins can be installed at once.
	p.Value("sceneId").String().NotEmpty()

	created := p.Value("id").String().Raw()
	apiV1(e, http.MethodGet, "/projects/"+created, uID).Expect().Status(http.StatusOK).
		JSON().Object().HasValue("sceneId", p.Value("sceneId").String().Raw())

	expectAPIError(t, apiV1(e, http.MethodPost, path, uID).WithJSON(map[string]any{"name": ""}).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodPost, path, uID).
		WithJSON(map[string]any{"name": "x", "visibility": "secret"}).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodPost, path, uID).WithText("{").
		WithHeader("Content-Type", "application/json").Expect(),
		http.StatusBadRequest, "invalid_input")

	// A reader cannot create projects.
	expectAPIError(t, apiV1(e, http.MethodPost, path, uID3).WithJSON(map[string]any{"name": "x"}).Expect(),
		http.StatusForbidden, "permission_denied")
}

func TestAPIV1UpdateProject(t *testing.T) {
	e := startPublicAPI(t)
	path := "/projects/" + pID.String()

	p := apiV1(e, http.MethodPatch, path, uID).
		WithJSON(map[string]any{"name": "renamed", "starred": true}).
		Expect().Status(http.StatusOK).JSON().Object()
	p.HasValue("name", "renamed")
	p.HasValue("starred", true)
	// Fields that were not given keep their value.
	p.HasValue("description", pDesc)

	expectAPIError(t, apiV1(e, http.MethodPatch, path, uID).WithJSON(map[string]any{"name": ""}).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodPatch, path, uID3).WithJSON(map[string]any{"name": "x"}).Expect(),
		http.StatusForbidden, "permission_denied")
	expectAPIError(t, apiV1(e, http.MethodPatch, path, uID2).WithJSON(map[string]any{"name": "x"}).Expect(),
		http.StatusNotFound, "not_found")
}

func TestAPIV1DeleteProject(t *testing.T) {
	e := startPublicAPI(t)
	path := "/projects/" + pID.String()
	list := "/workspaces/" + wID.String() + "/projects"

	// A project must be in the trash before it can be deleted for good.
	expectAPIError(t, apiV1(e, http.MethodDelete, path, uID).WithQuery("permanent", true).Expect(),
		http.StatusConflict, "conflict")

	expectAPIError(t, apiV1(e, http.MethodDelete, path, uID3).Expect(),
		http.StatusForbidden, "permission_denied")

	apiV1(e, http.MethodDelete, path, uID).Expect().Status(http.StatusNoContent)
	apiV1(e, http.MethodGet, path, uID).Expect().Status(http.StatusOK).JSON().Object().HasValue("deleted", true)
	apiV1(e, http.MethodGet, list, uID).Expect().Status(http.StatusOK).
		JSON().Object().Value("items").Array().IsEmpty()
	apiV1(e, http.MethodGet, list, uID).WithQuery("deleted", true).Expect().Status(http.StatusOK).
		JSON().Object().Value("items").Array().Length().IsEqual(1)

	// Moving it to the trash again is a no-op.
	apiV1(e, http.MethodDelete, path, uID).Expect().Status(http.StatusNoContent)

	apiV1(e, http.MethodDelete, path, uID).WithQuery("permanent", true).Expect().Status(http.StatusNoContent)
	expectAPIError(t, apiV1(e, http.MethodGet, path, uID).Expect(), http.StatusNotFound, "not_found")
}

func TestAPIV1Plugins(t *testing.T) {
	e := startPublicAPI(t)
	prj := apiV1(e, http.MethodPost, "/workspaces/"+wID.String()+"/projects", uID).
		WithJSON(map[string]any{"name": "plugins"}).
		Expect().Status(http.StatusCreated).JSON().Object().Value("id").String().Raw()
	path := "/projects/" + prj + "/plugins"
	zip, err := os.ReadFile(buildTestPluginZip(t, "testplugin", "1.0.0"))
	require.NoError(t, err)
	upload := func(user accountsID.UserID, body []byte) *httpexpect.Response {
		return apiV1(e, http.MethodPost, path, user).
			WithHeader("Content-Type", "application/zip").WithBytes(body).Expect()
	}

	p := upload(uID, zip).Status(http.StatusCreated).JSON().Object()
	p.HasValue("name", "Test Plugin")
	p.HasValue("version", "1.0.0")
	p.HasValue("system", false)
	p.Value("extensions").Array().Length().IsEqual(2)
	pluginID := p.Value("id").String().Raw()

	// The same ID and version replaces the plugin.
	upload(uID, zip).Status(http.StatusCreated).JSON().Object().HasValue("id", pluginID)

	ids := func() []string {
		var res []string
		for _, v := range apiV1(e, http.MethodGet, path, uID).Expect().Status(http.StatusOK).
			JSON().Object().Value("items").Array().Iter() {
			res = append(res, v.Object().Value("id").String().Raw())
		}
		return res
	}
	assert.ElementsMatch(t, []string{"reearth", pluginID}, ids())

	expectAPIError(t, upload(uID, []byte("not a zip")), http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodPost, path, uID).WithJSON(map[string]any{"url": "file:///etc/passwd"}).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, upload(uID3, zip), http.StatusForbidden, "permission_denied")
	expectAPIError(t, upload(uID2, zip), http.StatusNotFound, "not_found")

	expectAPIError(t, apiV1(e, http.MethodDelete, path+"/reearth", uID).Expect(),
		http.StatusBadRequest, "invalid_input")
	apiV1(e, http.MethodDelete, path+"/"+pluginID, uID).Expect().Status(http.StatusNoContent)
	assert.Equal(t, []string{"reearth"}, ids())
	expectAPIError(t, apiV1(e, http.MethodDelete, path+"/"+pluginID, uID).Expect(),
		http.StatusNotFound, "not_found")
}
