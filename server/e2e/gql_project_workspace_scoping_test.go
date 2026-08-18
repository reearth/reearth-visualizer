package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
)

// TestProjects_CrossTenantWorkspaceScoping is an end-to-end regression test for SEC-01: any
// authenticated user could read another workspace's projects (including private ones),
// because UsecaseMiddleware ran before the operator was attached to the request context, so
// the workspace/scene filters were never applied.
//
// Unlike the unit test in internal/app/usecase_test.go (which exercises UsecaseMiddleware's
// filtering logic directly), this test goes through the real HTTP server built by
// app.NewServer, so it also covers the app.go route wiring itself — it would fail if the
// second apiPrivateRoute.Use(newUsecaseMiddleware(...)) registration (the one that runs after
// the auth middleware) were ever removed.
//
// export REEARTH_DB=mongodb://localhost
// go test -v -run TestProjects_CrossTenantWorkspaceScoping ./e2e/...
func TestProjects_CrossTenantWorkspaceScoping(t *testing.T) {
	e := Server(t, baseSeeder)

	// baseSeeder creates project pID (private) in wID, owned by uID. uID2 owns a completely
	// separate workspace (wID2) and has no membership in wID at all.
	getProjects := func(workspaceID string, user string) *httpexpect.Value {
		requestBody := GraphQLRequest{
			OperationName: "GetProjects",
			Query:         GetProjectsQuery,
			Variables: map[string]any{
				"workspaceId": workspaceID,
				"pagination": map[string]any{
					"first": 16,
				},
			},
		}
		return Request(e, user, requestBody).Path("$.data.projects.edges")
	}

	t.Run("a user with no membership in the workspace cannot read its projects", func(t *testing.T) {
		edges := getProjects(wID.String(), uID2.String()).Array()
		edges.Length().IsEqual(0)
	})

	t.Run("the workspace owner can still read their own projects", func(t *testing.T) {
		edges := getProjects(wID.String(), uID.String()).Array()
		edges.Length().IsEqual(1)
		edges.Value(0).Object().Value("node").Object().Value("id").IsEqual(pID.String())
	})
}
