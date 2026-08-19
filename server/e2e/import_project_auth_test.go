package e2e

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestImportProjectPush_CrossTenantWriteDenied is a regression test for SEC-02: the
// unauthenticated /api/import-project endpoint built its acting identity straight from the
// request body, and the usecase container it used was captured before that identity existed,
// so it was never filtered -- the same root cause as SEC-01, at a different call site.
//
// This sends the exact shape of the real attack: an unauthenticated POST naming a workspace
// and project uID has no access to, but a real (uID2), unrelated user as the acting identity.
// It uses importCapableGateway (defined in storage_event_test.go) rather than the default fs
// gateway stub -- the stub's ReadImportProjectZip unconditionally returns (nil, nil), so it
// never reaches the code path that would call UpdateImportStatus at all, and a test against it
// would pass without ever exercising the write this is supposed to guard against.
//
// The HTTP response doesn't reflect whether the write was denied (UpdateImportStatus's own
// free function only logs its error), so this checks the actual side effect: the project's
// importStatus must still be NONE afterward, not FAILED.
//
// export REEARTH_DB=mongodb://localhost
// go test -v -run TestImportProjectPush_CrossTenantWriteDenied ./e2e/...
func TestImportProjectPush_CrossTenantWriteDenied(t *testing.T) {
	gw, err := newImportCapableGateway()
	require.NoError(t, err)

	e, _, _ := ServerAndReposWithFileGateway(t, baseSeeder, gw)

	// baseSeeder seeds project pID (private) in workspace wID, owned by uID. uID2 owns a
	// completely separate workspace (wID2) and has no membership in wID at all -- but is a
	// real account, same as an attacker naming their own account in the crafted filename.
	// Nothing is written to gw's memFs for this filename, so ReadImportProjectZip genuinely
	// fails, which is exactly what triggers UpdateImportStatus in the real handler.
	filename := fmt.Sprintf("%s-%s-%s.zip", wID.String(), pID.String(), uID2.String())
	body := fmt.Sprintf(
		`{"cloud_event_data":{"name":"import/%s","bucket":"test-bucket","contentType":"application/zip"}}`,
		filename,
	)

	// No Authorization header at all -- this is the whole point of the finding.
	e.POST("/api/import-project").
		WithHeader("Content-Type", "application/json").
		WithBytes([]byte(body)).
		Expect()

	requestBody := GraphQLRequest{
		OperationName: "GetProjects",
		Query:         GetProjectsQuery,
		Variables: map[string]any{
			"workspaceId": wID.String(),
			"pagination": map[string]any{
				"first": 16,
			},
		},
	}
	edges := Request(e, uID.String(), requestBody).Path("$.data.projects.edges").Array()

	found := false
	for _, edge := range edges.Iter() {
		node := edge.Object().Value("node").Object()
		if node.Value("id").String().Raw() != pID.String() {
			continue
		}
		found = true
		node.Value("metadata").Object().Value("importStatus").IsEqual("NONE")
	}
	if !found {
		t.Fatalf("expected to find project %s in workspace %s", pID.String(), wID.String())
	}
}
