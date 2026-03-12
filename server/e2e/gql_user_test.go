package e2e

import (
	"context"
	"fmt"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/idx"
	"golang.org/x/text/language"
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
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	u2 := accountsUser.New().ID(uId2).
		Name("e2e2").
		Workspace(wId2).
		Email("e2e2@e2e.com").
		Metadata(metadata).
		MustBuild()
	if err := r.User.Save(ctx, u2); err != nil {
		return err
	}
	u3 := accountsUser.New().ID(uId3).
		Name("e2e3").
		Workspace(wId2).
		Email("e2e3@e2e.com").
		Metadata(metadata).
		MustBuild()
	if err := r.User.Save(ctx, u3); err != nil {
		return err
	}
	roleOwner := accountsWorkspace.Member{
		Role:      accountsRole.RoleOwner,
		InvitedBy: uId1,
	}
	roleReader := accountsWorkspace.Member{
		Role:      accountsRole.RoleReader,
		InvitedBy: uId2,
	}

	wMetadata := accountsWorkspace.NewMetadata()
	w := accountsWorkspace.New().ID(wId1).
		Name("e2e").
		Members(map[idx.ID[accountsID.User]]accountsWorkspace.Member{
			uId1: roleOwner,
		}).
		Integrations(map[idx.ID[accountsID.Integration]]accountsWorkspace.Member{
			iId1: roleOwner,
		}).
		Metadata(wMetadata).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	w2 := accountsWorkspace.New().ID(wId2).
		Name("e2e2").
		Members(map[idx.ID[accountsID.User]]accountsWorkspace.Member{
			uId1: roleOwner,
			uId3: roleReader,
		}).
		Integrations(map[idx.ID[accountsID.Integration]]accountsWorkspace.Member{
			iId1: roleOwner,
		}).
		Metadata(wMetadata).
		MustBuild()
	if err := r.Workspace.Save(ctx, w2); err != nil {
		return err
	}

	return nil
}

func TestSearchUser(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)

	tests := []struct {
		name      string
		input     string
		wantFound bool
	}{
		{
			name:      "exact match",
			input:     "e2e",
			wantFound: true,
		},
		{
			name:      "trimming space",
			input:     " e2e",
			wantFound: true,
		},
		{
			name:      "not found",
			input:     "notfound",
			wantFound: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			query := fmt.Sprintf(`{ searchUser(nameOrEmail: "%s"){ id name email } }`, tt.input)
			request := GraphQLRequest{Query: query}
			resp := Request(e, uId1.String(), request).Object().Value("data").Object()

			if tt.wantFound {
				o := resp.Value("searchUser").Object()
				o.Value("id").String().IsEqual(uId1.String())
				o.Value("name").String().IsEqual("e2e")
				o.Value("email").String().IsEqual("e2e@e2e.com")
			} else {
				resp.Value("searchUser").IsNull()
				resp.NotContainsKey("errors")
			}
		})
	}
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
