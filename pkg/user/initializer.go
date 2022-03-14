package user

import (
	"golang.org/x/text/language"
)

type InitParams struct {
	Email    string
	Name     string
	Sub      *Auth
	Password *string
	Lang     *language.Tag
	Theme    *Theme
	UserID   *ID
	TeamID   *TeamID
}

func Init(p InitParams) (*User, *Team, error) {
	if p.UserID == nil {
		p.UserID = NewID().Ref()
	}
	if p.TeamID == nil {
		p.TeamID = NewTeamID().Ref()
	}
	if p.Lang == nil {
		p.Lang = &language.Tag{}
	}
	if p.Theme == nil {
		t := ThemeDefault
		p.Theme = &t
	}
	if p.Sub == nil {
		p.Sub = GenReearthSub(p.UserID.String())
	}

	b := New().
		ID(*p.UserID).
		Name(p.Name).
		Email(p.Email).
		Auths([]Auth{*p.Sub}).
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
	t, err := NewTeam().
		ID(*p.TeamID).
		Name(p.Name).
		Members(map[ID]Role{u.ID(): RoleOwner}).
		Personal(true).
		Build()
	if err != nil {
		return nil, nil, err
	}
	u.UpdateTeam(t.ID())

	return u, t, err
}
