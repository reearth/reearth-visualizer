package gqlmodel

import (
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/text/language"
)

func ToUser(u *user.User) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID()),
		Name:  u.Name(),
		Email: u.Email(),
		Host:  lo.EmptyableToPtr(u.Host()),
	}
}

func ToUserFromSimple(u *user.Simple) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID),
		Name:  u.Name,
		Email: u.Email,
	}
}

func ToMe(u *user.User) *Me {
	if u == nil {
		return nil
	}

	metadata := u.Metadata()
	var userMetadata *UserMetadata

	var lang language.Tag
	var theme user.Theme

	if metadata != nil {
		lang = metadata.Lang()
		theme = metadata.Theme()

		if metadata.PhotoURL() != "" {
			photoURL := metadata.PhotoURL()
			userMetadata = &UserMetadata{
				PhotoURL: &photoURL,
			}
		}
	} else {
		lang = language.English
		theme = user.ThemeDefault
	}

	return &Me{
		ID:            IDFrom(u.ID()),
		Name:          u.Name(),
		Email:         u.Email(),
		Lang:          lang,
		Theme:         Theme(theme),
		Metadata:      userMetadata,
		MyWorkspaceID: IDFrom(u.Workspace()),
		Auths: util.Map(u.Auths(), func(a user.Auth) string {
			return a.Provider
		}),
	}
}

func ToGQLTheme(t user.Theme) Theme {
	switch t {
	case user.ThemeDark:
		return ThemeDark
	case user.ThemeLight:
		return ThemeLight
	default:
		return ThemeDefault
	}
}

func ToTheme(t *Theme) *user.Theme {
	if t == nil {
		return nil
	}

	th := user.ThemeDefault
	switch *t {
	case ThemeDark:
		th = user.ThemeDark
	case ThemeLight:
		th = user.ThemeLight
	}
	return &th
}
