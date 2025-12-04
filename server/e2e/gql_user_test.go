package e2e

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"golang.org/x/text/language"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

var (
	uId1 = accountsID.NewUserID()
	uId2 = accountsID.NewUserID()
	uId3 = accountsID.NewUserID()
	wId1 = accountsID.NewWorkspaceID()
	wId2 = accountsID.NewWorkspaceID()
	iId1 = accountsID.NewIntegrationID()
)

func baseSeederUser(ctx context.Context, r *repo.Container, f gateway.File) error {
	auth := accountsUser.ReearthSub(uId1.String())

	metadata := accountsUser.NewMetadata()
	metadata.SetLang(language.Japanese)
	metadata.SetTheme(accountsUser.ThemeDark)

	u := accountsUser.New().ID(uId1).
		Name("e2e").
		Email("e2e@e2e.com").
		Auths([]accountsUser.Auth{*auth}).
		Metadata(metadata).
		Workspace(wId1).
		MustBuild()
	if err := r.AccountsUser.Save(ctx, u); err != nil {
		return err
	}
	u2 := accountsUser.New().ID(uId2).
		Name("e2e2").
		Workspace(wId2).
		Email("e2e2@e2e.com").
		Metadata(metadata).
		MustBuild()
	if err := r.AccountsUser.Save(ctx, u2); err != nil {
		return err
	}
	u3 := accountsUser.New().ID(uId3).
		Name("e2e3").
		Workspace(wId2).
		Email("e2e3@e2e.com").
		Metadata(metadata).
		MustBuild()
	if err := r.AccountsUser.Save(ctx, u3); err != nil {
		return err
	}
	roleOwner := accountsWorkspace.Member{
		Role:      accountsWorkspace.RoleOwner,
		InvitedBy: uId1,
	}
	roleReader := accountsWorkspace.Member{
		Role:      accountsWorkspace.RoleReader,
		InvitedBy: uId2,
	}

	wMetadata := accountsWorkspace.NewMetadata()
	w := accountsWorkspace.New().ID(wId1).
		Name("e2e").
		Members(map[accountsID.UserID]accountsWorkspace.Member{
			uId1: roleOwner,
		}).
		Integrations(map[accountsID.IntegrationID]accountsWorkspace.Member{
			iId1: roleOwner,
		}).
		Metadata(wMetadata).
		MustBuild()
	if err := r.AccountsWorkspace.Save(ctx, w); err != nil {
		return err
	}

	w2 := accountsWorkspace.New().ID(wId2).
		Name("e2e2").
		Members(map[accountsID.UserID]accountsWorkspace.Member{
			uId1: roleOwner,
			uId3: roleReader,
		}).
		Integrations(map[accountsID.IntegrationID]accountsWorkspace.Member{
			iId1: roleOwner,
		}).
		Metadata(wMetadata).
		MustBuild()
	if err := r.AccountsWorkspace.Save(ctx, w2); err != nil {
		return err
	}

	return nil
}

func TestSearchUser(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)
	query := fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, "e2e")
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object().Value("data").Object().Value("searchUser").Object()
	o.Value("id").String().IsEqual(uId1.String())
	o.Value("name").String().IsEqual("e2e")
	o.Value("email").String().IsEqual("e2e@e2e.com")

	query = fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, "notfound")
	request = GraphQLRequest{
		Query: query,
	}
	resp := Request(e, uId1.String(), request).Object()
	resp.Value("data").Object().Value("searchUser").IsNull()

	resp.NotContainsKey("errors") // not exist
}

func TestNode(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)
	query := fmt.Sprintf(` { node(id: "%s", type: USER){ id } }`, uId1.String())
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object().Value("data").Object().Value("node").Object()
	o.Value("id").String().IsEqual(uId1.String())
}

func TestNodes(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)
	query := fmt.Sprintf(` { nodes(id: "%s", type: USER){ id } }`, uId1.String())
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object().Value("data").Object().Value("nodes")
	o.Array().ContainsAll(map[string]string{"id": uId1.String()})
}
