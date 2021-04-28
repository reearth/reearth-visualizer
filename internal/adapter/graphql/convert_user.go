package graphql

import (
	"github.com/reearth/reearth-backend/pkg/user"
)

// ToUser _
func ToUser(user *user.User) *User {
	return toUser(user)
}

func toUser(user *user.User) *User {
	if user == nil {
		return nil
	}
	auths := user.Auths()
	authsgql := make([]string, 0, len(auths))
	for _, a := range auths {
		authsgql = append(authsgql, a.Provider)
	}
	return &User{
		ID:       user.ID().ID(),
		Name:     user.Name(),
		Email:    user.Email(),
		Lang:     user.Lang().String(),
		MyTeamID: user.Team().ID(),
		Auths:    authsgql,
	}
}

func toSearchedUser(u *user.User) *SearchedUser {
	if u == nil {
		return nil
	}
	return &SearchedUser{
		UserID:    u.ID().ID(),
		UserName:  u.Name(),
		UserEmail: u.Email(),
	}
}

func toTheme(t *Theme) *user.Theme {
	th := user.ThemeDefault

	if t == nil {
		return nil
	}

	switch *t {
	case ThemeDark:
		th = user.ThemeDark
	case ThemeLight:
		th = user.ThemeLight
	}
	return &th
}
