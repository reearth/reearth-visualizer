package e2e

import (
	"fmt"
	"testing"
)

// go test -v -run TestWorkspacePolicyCheck ./e2e/...
func TestWorkspacePolicyCheck(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)

	// Test successful policy check for existing workspace
	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`query {
			workspacePolicyCheck(input: {workspaceId: "%s"}) {
				workspaceId
				enableToCreatePrivateProject
			}
		}`, wId1),
	})

	// Verify the response structure
	res.Path("$.data.workspacePolicyCheck.workspaceId").IsEqual(wId1.String())
	res.Path("$.data.workspacePolicyCheck.enableToCreatePrivateProject").IsBoolean()

	// Test with non-existent workspace ID
	nonExistentWorkspaceId := "01H4XCVR7QZJN0Z8V9XN9N9N9N"
	res = Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`query {
			workspacePolicyCheck(input: {workspaceId: "%s"}) {
				workspaceId
				enableToCreatePrivateProject
			}
		}`, nonExistentWorkspaceId),
	})

	// Should return error for non-existent workspace
	res.Path("$.errors[0].message").IsString()

	// Test with invalid workspace ID format
	res = Request(e, uId1.String(), GraphQLRequest{
		Query: `query {
			workspacePolicyCheck(input: {workspaceId: "invalid-id"}) {
				workspaceId
				enableToCreatePrivateProject
			}
		}`,
	})

	// Should return error for invalid ID format
	res.Path("$.errors[0].message").IsString()
}

// Test policy check with different user permissions
func TestWorkspacePolicyCheckPermissions(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)

	// Test with workspace owner
	res := Request(e, uId1.String(), GraphQLRequest{
		Query: fmt.Sprintf(`query {
			workspacePolicyCheck(input: {workspaceId: "%s"}) {
				workspaceId
				enableToCreatePrivateProject
			}
		}`, wId1),
	})

	res.Path("$.data.workspacePolicyCheck.workspaceId").IsEqual(wId1.String())
	res.Path("$.data.workspacePolicyCheck.enableToCreatePrivateProject").IsBoolean()
	res.Path("$.data.workspacePolicyCheck.enableToCreatePrivateProject").IsEqual(true)

	// Test with different user (should still work if they have access to the workspace)
	res = Request(e, uId2.String(), GraphQLRequest{
		Query: fmt.Sprintf(`query {
			workspacePolicyCheck(input: {workspaceId: "%s"}) {
				workspaceId
				enableToCreatePrivateProject
			}
		}`, wId1),
	})

	res.Path("$.data.workspacePolicyCheck.workspaceId").IsEqual(wId1.String())
	res.Path("$.data.workspacePolicyCheck.enableToCreatePrivateProject").IsBoolean()
	res.Path("$.data.workspacePolicyCheck.enableToCreatePrivateProject").IsEqual(true)
}
