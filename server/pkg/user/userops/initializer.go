package userops

import (
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"golang.org/x/text/language"
)

type InitParams struct {
	Email    string
	Name     string
	Sub      *user.Auth
	Password *string
	Lang     *language.Tag
	Theme    *user.Theme
	UserID   *user.ID
	TeamID   *workspace.ID
}

func Init(p InitParams) (*user.User, *workspace.Workspace, error) {
	if p.UserID == nil {
		p.UserID = user.NewID().Ref()
	}
	if p.TeamID == nil {
		p.TeamID = workspace.NewID().Ref()
	}
	if p.Lang == nil {
		p.Lang = &language.Tag{}
	}
	if p.Theme == nil {
		t := user.ThemeDefault
		p.Theme = &t
	}
	if p.Sub == nil {
		p.Sub = user.GenReearthSub(p.UserID.String())
	}

	b := user.New().
		ID(*p.UserID).
		Name(p.Name).
		Email(p.Email).
		Auths([]user.Auth{*p.Sub}).
		Lang(*p.Lang).
		Theme(*p.Theme)
	if p.Password != nil {
		b = b.PasswordPlainText(*p.Password)
	}
	u, err := b.Build()
	if err != nil {
		return nil, nil, err
	}

	// create a user's own team
	t, err := workspace.New().
		ID(*p.TeamID).
		Name(p.Name).
		Members(map[user.ID]workspace.Role{u.ID(): workspace.RoleOwner}).
		Personal(true).
		Build()
	if err != nil {
		return nil, nil, err
	}
	u.UpdateTeam(t.ID())

	return u, t, err
}
