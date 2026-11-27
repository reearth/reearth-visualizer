package e2e

import (
	"net/http"
	"testing"
)

func TestAPIV1WorkspaceAlias(t *testing.T) {
	e := startPublicAPI(t)
	projects := func(ws string) string { return "/workspaces/" + ws + "/projects" }

	apiV1(e, http.MethodGet, projects(wAlias), uID).Expect().Status(http.StatusOK).
		JSON().Object().Value("items").Array().Value(0).Object().HasValue("id", pID.String())
	apiV1(e, http.MethodGet, projects(wAlias), uID3).Expect().Status(http.StatusOK)

	expectAPIError(t, apiV1(e, http.MethodGet, projects(wAlias), uID2).Expect(),
		http.StatusNotFound, "not_found")
	expectAPIError(t, apiV1(e, http.MethodGet, projects("no-such-workspace"), uID).Expect(),
		http.StatusNotFound, "not_found")

	apiV1(e, http.MethodPost, projects(wAlias), uID).
		WithJSON(map[string]any{"name": "by alias", "visibility": "private"}).
		Expect().Status(http.StatusCreated).JSON().Object().HasValue("workspaceId", wID.String())
	expectAPIError(t, apiV1(e, http.MethodPost, projects(wAlias2), uID).
		WithJSON(map[string]any{"name": "x", "visibility": "private"}).Expect(),
		http.StatusNotFound, "not_found")
}

func TestAPIV1ProjectAlias(t *testing.T) {
	e := startPublicAPI(t)
	const alias = "alias-e2e-project"

	created := apiV1(e, http.MethodPost, "/workspaces/"+wID.String()+"/projects", uID).
		WithJSON(map[string]any{"name": "aliased", "visibility": "private", "alias": alias}).
		Expect().Status(http.StatusCreated).JSON().Object().Value("id").String().Raw()

	for _, ws := range []string{wAlias, wID.String()} {
		apiV1(e, http.MethodGet, "/projects/"+alias, uID).WithQuery("workspace", ws).
			Expect().Status(http.StatusOK).JSON().Object().HasValue("id", created)
	}
	apiV1(e, http.MethodGet, "/projects/"+alias+"/plugins", uID).WithQuery("workspace", wAlias).
		Expect().Status(http.StatusOK)
	apiV1(e, http.MethodPatch, "/projects/"+alias, uID).WithQuery("workspace", wAlias).
		WithJSON(map[string]any{"name": "renamed by alias"}).
		Expect().Status(http.StatusOK).JSON().Object().HasValue("name", "renamed by alias")

	apiV1(e, http.MethodGet, "/projects/"+pID.String(), uID).WithQuery("workspace", wAlias2).
		Expect().Status(http.StatusOK)

	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/"+alias, uID).Expect(),
		http.StatusBadRequest, "invalid_input")
	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/no-such-project", uID).
		WithQuery("workspace", wAlias).Expect(),
		http.StatusNotFound, "not_found")
	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/"+alias, uID2).
		WithQuery("workspace", wAlias).Expect(),
		http.StatusNotFound, "not_found")
	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/"+alias, uID2).
		WithQuery("workspace", wAlias2).Expect(),
		http.StatusNotFound, "not_found")
	expectAPIError(t, apiV1(e, http.MethodGet, "/projects/"+alias, uID).
		WithQuery("workspace", "no-such-workspace").Expect(),
		http.StatusNotFound, "not_found")
}
