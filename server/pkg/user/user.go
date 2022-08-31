package user

import (
	"errors"
	"net/mail"

	"golang.org/x/exp/slices"
	"golang.org/x/text/language"
)

var (
	ErrInvalidEmail = errors.New("invalid email")
)

type User struct {
	id            ID
	name          string
	email         string
	password      EncodedPassword
	workspace     WorkspaceID
	auths         Auths
	lang          language.Tag
	theme         Theme
	verification  *Verification
	passwordReset *PasswordReset
}

func (u *User) ID() ID {
	return u.id
}

func (u *User) Name() string {
	return u.name
}

func (u *User) Email() string {
	return u.email
}

func (u *User) Workspace() WorkspaceID {
	return u.workspace
}

func (u *User) Lang() language.Tag {
	return u.lang
}

func (u *User) Theme() Theme {
	return u.theme
}

func (u *User) Password() []byte {
	return u.password
}

func (u *User) UpdateName(name string) {
	u.name = name
}

func (u *User) UpdateEmail(email string) error {
	if _, err := mail.ParseAddress(email); err != nil {
		return ErrInvalidEmail
	}
	u.email = email
	return nil
}

func (u *User) UpdateWorkspace(workspace WorkspaceID) {
	u.workspace = workspace
}

func (u *User) UpdateLang(lang language.Tag) {
	u.lang = lang
}

func (u *User) UpdateTheme(t Theme) {
	u.theme = t
}

func (u *User) Verification() *Verification {
	return u.verification
}

func (u *User) Auths() Auths {
	if u == nil {
		return nil
	}
	return slices.Clone(u.auths)
}

func (u *User) SetAuths(a Auths) {
	u.auths = slices.Clone(a)
}

func (u *User) AddAuth(a Auth) bool {
	auths := u.auths.Add(a)
	if len(auths) != len(u.auths) {
		u.auths = auths
		return true
	}
	return false
}

func (u *User) RemoveAuth(sub string) bool {
	auths := u.auths.Remove(sub)
	if len(auths) != len(u.auths) {
		u.auths = auths
		return true
	}
	return false
}

func (u *User) RemoveAuthByProvider(p string) bool {
	auths := u.auths.RemoveByProvider(p)
	if len(auths) != len(u.auths) {
		u.auths = auths
		return true
	}
	return false
}

func (u *User) SetPassword(pass string) error {
	p, err := NewEncodedPassword(pass)
	if err != nil {
		return err
	}
	u.password = p
	return nil
}

func (u *User) MatchPassword(pass string) (bool, error) {
	if u == nil {
		return false, nil
	}
	return u.password.Verify(pass)
}

func (u *User) PasswordReset() *PasswordReset {
	return u.passwordReset
}

func (u *User) SetPasswordReset(pr *PasswordReset) {
	u.passwordReset = pr.Clone()
}

func (u *User) SetVerification(v *Verification) {
	u.verification = v
}
