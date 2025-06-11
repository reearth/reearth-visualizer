package e2e

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

var (
	uId1 = accountdomain.NewUserID()
	uId2 = accountdomain.NewUserID()
	uId3 = accountdomain.NewUserID()
	wId1 = accountdomain.NewWorkspaceID()
	wId2 = accountdomain.NewWorkspaceID()
	iId1 = accountdomain.NewIntegrationID()
)

func baseSeederUser(ctx context.Context, r *repo.Container, f gateway.File) error {
	auth := user.ReearthSub(uId1.String())
	u := user.New().ID(uId1).
		Name("e2e").
		Email("e2e@e2e.com").
		Auths([]user.Auth{*auth}).
		Theme(user.ThemeDark).
		Lang(language.Japanese).
		Workspace(wId1).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	u2 := user.New().ID(uId2).
		Name("e2e2").
		Workspace(wId2).
		Email("e2e2@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u2); err != nil {
		return err
	}
	u3 := user.New().ID(uId3).
		Name("e2e3").
		Workspace(wId2).
		Email("e2e3@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u3); err != nil {
		return err
	}
	roleOwner := workspace.Member{
		Role:      workspace.RoleOwner,
		InvitedBy: uId1,
	}
	roleReader := workspace.Member{
		Role:      workspace.RoleReader,
		InvitedBy: uId2,
	}

	w := workspace.New().ID(wId1).
		Name("e2e").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	w2 := workspace.New().ID(wId2).
		Name("e2e2").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
			uId3: roleReader,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w2); err != nil {
		return err
	}

	return nil
}

func TestUpdateMe(t *testing.T) {
	e, _ := StartGQLServerAndRepos(t, baseSeederUser)
	query := `mutation { updateMe(input: {name: "updated",email:"hoge@test.com",lang: "ja",theme: DEFAULT,password: "Ajsownndww1",passwordConfirmation: "Ajsownndww1"}){ me{ id name email lang theme } }}`
	request := GraphQLRequest{
		Query: query,
	}
	o := Request(e, uId1.String(), request).Object().Value("data").Object().Value("updateMe").Object().Value("me").Object()
	o.Value("name").String().IsEqual("updated")
	o.Value("email").String().IsEqual("hoge@test.com")
	o.Value("lang").String().IsEqual("ja")
	o.Value("theme").String().IsEqual("default")
}

func TestRemoveMyAuth(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)
	u, err := r.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.Equal(t, &user.Auth{Provider: "reearth", Sub: "reearth|" + uId1.String()}, u.Auths().GetByProvider("reearth"))

	query := `mutation { removeMyAuth(input: {auth: "reearth"}){ me{ id name email lang theme } }}`
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request).Object()

	u, err = r.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.Nil(t, u.Auths().Get("sub"))
}

func TestDeleteMe(t *testing.T) {
	e, r := StartGQLServerAndRepos(t, baseSeederUser)
	u, err := r.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.NotNil(t, u)

	query := fmt.Sprintf(`mutation { deleteMe(input: {userId: "%s"}){ userId }}`, uId1)
	request := GraphQLRequest{
		Query: query,
	}
	Request(e, uId1.String(), request).Object()

	_, err = r.User.FindByID(context.Background(), uId1)
	assert.Equal(t, rerror.ErrNotFound, err)
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

	query = fmt.Sprintf(` { searchUser(nameOrEmail: "%s"){ id name email } }`, " e2e")
	request = GraphQLRequest{
		Query: query,
	}
	o = Request(e, uId1.String(), request).Object().Value("data").Object().Value("searchUser").Object()
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
