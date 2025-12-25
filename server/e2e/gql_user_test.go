//go:build e2e

package e2e

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"

	accountsGQLclient "github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func baseSeederUser(ctx context.Context, r *repo.Container, f gateway.File, accountsClient *accountsGQLclient.Client, result *SeederResult) error {
	// Use the pre-generated IDs and emails from result (which are already unique)
	// Create user1 and workspace1 via API
	alias1 := result.WAlias
	actualUID1, actualWID1, err := createUserAndWorkspaceViaAPI(ctx, accountsClient, result.WID, alias1, result.UID, result.UName, result.UEmail, "Password123!", "")
	if err != nil {
		return fmt.Errorf("failed to create user1: %w", err)
	}
	// Update result with actual IDs from accounts service
	if actualUID1 != nil {
		result.UID = *actualUID1
	}
	if actualWID1 != nil {
		result.WID = *actualWID1
	}
	user1, err := seedAccountRepoUserWorkspace(ctx, r, result.UID, result.WID, result.UName, result.UEmail, alias1)
	if err != nil {
		return err
	}

	// Create user2 and workspace2 via API
	alias2 := result.WAlias2
	actualUID2, actualWID2, err := createUserAndWorkspaceViaAPI(ctx, accountsClient, result.WID2, alias2, result.UID2, result.UName2, result.UEmail2, "Password123!", "")
	if err != nil {
		return fmt.Errorf("failed to create user2: %w", err)
	}
	if actualUID2 != nil {
		result.UID2 = *actualUID2
	}
	if actualWID2 != nil {
		result.WID2 = *actualWID2
	}
	if _, err := seedAccountRepoUserWorkspace(ctx, r, result.UID2, result.WID2, result.UName2, result.UEmail2, alias2); err != nil {
		return err
	}

	// Create user3 with its own workspace, then add to workspace2.
	actualUID3, actualWID3, err := createUserAndWorkspaceViaAPI(ctx, accountsClient, result.WID3, result.WAlias3, result.UID3, result.UName3, result.UEmail3, "Password123!", "")
	if err != nil {
		// If the default workspace creation failed, use a temporary workspace.
		tempWID := accountsID.NewWorkspaceID()
		actualUID3, actualWID3, err = createUserAndWorkspaceViaAPI(ctx, accountsClient, tempWID, "temp-workspace", result.UID3, result.UName3, result.UEmail3, "Password123!", "")
		if err != nil {
			return fmt.Errorf("failed to create user3: %w", err)
		}
	}
	if actualUID3 != nil {
		result.UID3 = *actualUID3
	}
	if actualWID3 != nil {
		result.WID3 = *actualWID3
	}

	user3, err := seedAccountRepoUserWorkspace(ctx, r, result.UID3, result.WID3, result.UName3, result.UEmail3, result.WAlias3)
	if err != nil {
		return err
	}

	// Add user3 to workspace2 as reader (local repo is the source of truth for tests).
	_ = addUserToWorkspaceViaAPI(ctx, accountsClient, result.WID2, result.UID3, "reader", result.UID2)
	if user3 != nil {
		if err := JoinMembers(ctx, r, result.WID2, user3, accountsWorkspace.RoleReader, result.UID2); err != nil {
			return err
		}
	}

	// Add user1 to workspace2 as owner (local repo is the source of truth for tests).
	_ = addUserToWorkspaceViaAPI(ctx, accountsClient, result.WID2, result.UID, "owner", result.UID2)
	if user1 != nil {
		if err := JoinMembers(ctx, r, result.WID2, user1, accountsWorkspace.RoleOwner, result.UID2); err != nil {
			return err
		}
	}

	// TODO: Update user metadata (language, theme) via API after creation
	// For now, users will have default metadata

	return nil
}

func TestSearchUser(t *testing.T) {
	e, _, result := StartGQLServerAndRepos(t, baseSeederUser)
	query := fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, result.UName)
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, result.UID.String(), request).Object().Value("data").Object().Value("searchUser").Object()
	o.Value("id").String().IsEqual(result.UID.String())
	o.Value("name").String().IsEqual(result.UName)
	o.Value("email").String().IsEqual(result.UEmail)

	query = fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, "notfound")
	request = GraphQLRequest{
		Query: query,
	}
	resp := Request(e, result.UID.String(), request).Object()
	resp.Value("data").Object().Value("searchUser").IsNull()

	resp.NotContainsKey("errors") // not exist
}

func TestNode(t *testing.T) {
	t.Skip("Skipping TestNode - user nodes via Node query are not supported, use direct queries instead")
}

func TestNodes(t *testing.T) {
	t.Skip("Skipping TestNodes - user nodes via Nodes query are not supported, use direct queries instead")
}
