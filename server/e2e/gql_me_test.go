package e2e

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
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
      policyId
      policy {
        id
        name
        projectCount
        memberCount
        publishedProjectCount
        layerCount
        assetStorageSize
        __typename
      }
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
      policyId
      policy {
        id
        name
        projectCount
        memberCount
        publishedProjectCount
        layerCount
        assetStorageSize
        __typename
      }
	  enableToCreatePrivateProject
      __typename
    }
    auths
    __typename
  }
}`

// go test -v -run TestMe ./e2e/...

func TestMe(t *testing.T) {
	e := Server(t, baseSeeder)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         GetMeQuery,
		Variables:     map[string]any{},
	}

	res := Request(e, uID.String(), requestBody)

	me := res.Path("$.data.me")

	// ValueDump(me)

	me.Object().HasValue("email", uEmail)
	me.Object().HasValue("id", uID.String())
	me.Object().HasValue("name", uName)

	me.Path("$.myWorkspace.enableToCreatePrivateProject").IsEqual(false)

	me.Path("$.workspaces[0].enableToCreatePrivateProject").IsEqual(false)

}

// go test -v -run TestMeWithPhotoURL ./e2e/...

func TestMeWithPhotoURL(t *testing.T) {
	e := Server(t, seederWithPhotoURL)

	requestBody := GraphQLRequest{
		OperationName: "GetMe",
		Query:         GetMeQuery,
		Variables:     map[string]any{},
	}

	res := Request(e, uID.String(), requestBody)

	me := res.Path("$.data.me")

	// Verify basic user info
	me.Object().HasValue("email", uEmail)
	me.Object().HasValue("id", uID.String())
	me.Object().HasValue("name", uName)

	// Verify photoURL is present
	me.Path("$.metadata.photoURL").IsEqual("https://example.com/photo.jpg")
}

func seederWithPhotoURL(ctx context.Context, r *repo.Container, f gateway.File) error {
	defer util.MockNow(now)()

	// Create metadata with photoURL
	metadata := user.NewMetadata()
	metadata.SetPhotoURL("https://example.com/photo.jpg")

	// Create user with photoURL in metadata
	u := user.New().
		ID(uID).
		Workspace(wID).
		Name(uName).
		Email(uEmail).
		Metadata(metadata).
		MustBuild()

	if err := r.User.Save(ctx, u); err != nil {
		return err
	}

	// Create workspace for the user
	m := workspace.Member{
		Role: workspace.RoleOwner,
	}
	w := workspace.New().ID(wID).
		Name(uName).
		Personal(false).
		Members(map[accountdomain.UserID]workspace.Member{u.ID(): m}).
		Metadata(workspace.NewMetadata()).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	// Run base setup (creates scenes, projects, etc.)
	if err := baseSetup(ctx, r, f); err != nil {
		return err
	}

	// Create additional users and workspaces
	_, err := createUserAndWorkspace(ctx, r, wID2, uID2, uName2, uEmail2)
	if err != nil {
		return err
	}

	u3, err := createUserAndWorkspace(ctx, r, wID3, uID3, uName3, uEmail3)
	if err != nil {
		return err
	}

	// assign user3 to user1's workspace
	if err := JoinMembers(ctx, r, wID, u3, workspace.RoleReader, uID); err != nil {
		return err
	}

	return nil
}
