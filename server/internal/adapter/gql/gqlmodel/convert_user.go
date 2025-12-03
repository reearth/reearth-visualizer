package gqlmodel

import (
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/text/language"

	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

func ToUser(u *accountsUser.User) *User {
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

func ToUserFromSimple(u *accountsUser.Simple) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID),
		Name:  u.Name,
		Email: u.Email,
	}
}

func ToMe(u *accountsUser.User) *Me {
	if u == nil {
		return nil
	}

	metadata := u.Metadata()
	var userMetadata *UserMetadata

	var lang language.Tag
	var theme accountsUser.Theme

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
		theme = accountsUser.ThemeDefault
	}

	return &Me{
		ID:            IDFrom(u.ID()),
		Name:          u.Name(),
		Email:         u.Email(),
		Lang:          lang,
		Theme:         Theme(theme),
		Metadata:      userMetadata,
		MyWorkspaceID: IDFrom(u.Workspace()),
		Auths: util.Map(u.Auths(), func(a accountsUser.Auth) string {
			return a.Provider
		}),
	}
}

func ToGQLTheme(t accountsUser.Theme) Theme {
	switch t {
	case accountsUser.ThemeDark:
		return ThemeDark
	case accountsUser.ThemeLight:
		return ThemeLight
	default:
		return ThemeDefault
	}
}

func ToTheme(t *Theme) *accountsUser.Theme {
	if t == nil {
		return nil
	}

	th := accountsUser.ThemeDefault
	switch *t {
	case ThemeDark:
		th = accountsUser.ThemeDark
	case ThemeLight:
		th = accountsUser.ThemeLight
	}
	return &th
}
