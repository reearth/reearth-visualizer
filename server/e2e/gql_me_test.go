//go:build e2e

package e2e

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/util"

	accountsGQLclient "github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

const GetMeQuery = `
query GetMe {
  me {
    id
    name
    email
    lang
    theme
    metadata {
      photoURL
    }
    myWorkspace {
      id
      name
      enableToCreatePrivateProject
      __typename
    }
    workspaces {
      id
      name
      personal
      members {
        user {
          id
          name
          email
          __typename
        }
        userId
        role
        __typename
      }
	  enableToCreatePrivateProject
      __typename
    }
    auths
    __typename
  }
}`

// make e2e-test TEST_NAME=TestMe
func TestMe(t *testing.T) {
	e, result := Server(t, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         GetMeQuery,
		Variables:     map[string]any{},
	}

	res := Request(e, result.UID.String(), requestBody)

	me := res.Path("$.data.me")

	// ValueDump(me)

	me.Object().HasValue("email", result.UEmail)
	me.Object().HasValue("id", result.UID.String())
	me.Object().HasValue("name", result.UName)

	me.Path("$.myWorkspace.enableToCreatePrivateProject").IsEqual(false)

	me.Path("$.workspaces[0].enableToCreatePrivateProject").IsEqual(false)

}

// make e2e-test TEST_NAME=TestMeWithPhotoURL

func TestMeWithPhotoURL(t *testing.T) {
	e, result := Server(t, seederWithPhotoURL)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         GetMeQuery,
		Variables:     map[string]any{},
	}

	res := Request(e, result.UID.String(), requestBody)

	me := res.Path("$.data.me")

	// Verify basic user info
	me.Object().HasValue("email", result.UEmail)
	me.Object().HasValue("id", result.UID.String())
	me.Object().HasValue("name", result.UName)

	// Verify photoURL is present
	// TODO: Update this test when photoURL support is added to reearth-accounts
	// me.Path("$.metadata.photoURL").IsEqual("https://example.com/photo.jpg")
}

func seederWithPhotoURL(ctx context.Context, r *repo.Container, f gateway.File, accountsClient *accountsGQLclient.Client, result *SeederResult) error {
	defer util.MockNow(now)()

	// Create user via API
	actualUID, actualWID, err := createUserAndWorkspaceViaAPI(ctx, accountsClient, result.WID, result.WAlias, result.UID, result.UName, result.UEmail, "Password123!", "")
	if err != nil {
		return err
	}
	// Update result with actual IDs from accounts service
	if actualUID != nil {
		result.UID = *actualUID
	}
	if actualWID != nil {
		result.WID = *actualWID
	}

	user1, err := seedAccountRepoUserWorkspace(ctx, r, result.UID, result.WID, result.UName, result.UEmail, result.WAlias)
	if err != nil {
		return err
	}
	if user1 != nil {
		metadata := accountsUser.NewMetadata()
		metadata.SetPhotoURL("https://example.com/photo.jpg")
		user1.SetMetadata(metadata)
		if err := r.User.Save(ctx, user1); err != nil {
			return err
		}
	}

	// TODO: Update user photoURL via API after creation
	// For now, we create the user first and the photoURL will need to be set separately

	// Run base setup (creates scenes, projects, etc.)
	if err := baseSetup(ctx, r, f, result); err != nil {
		return err
	}

	// Create additional users and workspaces
	actualUID2, actualWID2, err := createUserAndWorkspaceViaAPI(ctx, accountsClient, result.WID2, result.WAlias2, result.UID2, result.UName2, result.UEmail2, "Password123!", "")
	if err != nil {
		return err
	}
	if actualUID2 != nil {
		result.UID2 = *actualUID2
	}
	if actualWID2 != nil {
		result.WID2 = *actualWID2
	}

	if _, err := seedAccountRepoUserWorkspace(ctx, r, result.UID2, result.WID2, result.UName2, result.UEmail2, result.WAlias2); err != nil {
		return err
	}

	actualUID3, actualWID3, err := createUserAndWorkspaceViaAPI(ctx, accountsClient, result.WID3, result.WAlias3, result.UID3, result.UName3, result.UEmail3, "Password123!", "")
	if err != nil {
		return err
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

	// assign user3 to user1's workspace
	if err := addUserToWorkspaceViaAPI(ctx, accountsClient, result.WID, result.UID3, "reader", result.UID); err != nil {
		return err
	}
	if user1 != nil && user3 != nil {
		if err := JoinMembers(ctx, r, result.WID, user3, accountsWorkspace.RoleReader, result.UID); err != nil {
			return err
		}
	}

	return nil
}
