package user

import (
	"errors"
	"unicode"

	"golang.org/x/crypto/bcrypt"

	"golang.org/x/text/language"
)

var (
	ErrEncodingPassword = errors.New("error encoding password")
	ErrInvalidPassword  = errors.New("error invalid password")
	ErrPasswordLength   = errors.New("password at least 8 characters")
	ErrPasswordUpper    = errors.New("password should have upper case letters")
	ErrPasswordLower    = errors.New("password should have lower case letters")
	ErrPasswordNumber   = errors.New("password should have numbers")
)

type User struct {
	id            ID
	name          string
	email         string
	password      []byte
	team          TeamID
	auths         []Auth
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

func (u *User) Team() TeamID {
	return u.team
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

func (u *User) UpdateEmail(email string) {
	u.email = email
}

func (u *User) UpdateTeam(team TeamID) {
	u.team = team
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

func (u *User) Auths() []Auth {
	if u == nil {
		return nil
	}
	return append([]Auth{}, u.auths...)
}

func (u *User) ContainAuth(a Auth) bool {
	if u == nil {
		return false
	}
	for _, b := range u.auths {
		if a == b || a.Provider == b.Provider {
			return true
		}
	}
	return false
}

func (u *User) HasAuthProvider(p string) bool {
	if u == nil {
		return false
	}
	for _, b := range u.auths {
		if b.Provider == p {
			return true
		}
	}
	return false
}

func (u *User) AddAuth(a Auth) bool {
	if u == nil {
		return false
	}
	if !u.ContainAuth(a) {
		u.auths = append(u.auths, a)
		return true
	}
	return false
}

func (u *User) RemoveAuth(a Auth) bool {
	if u == nil || a.IsAuth0() {
		return false
	}
	for i, b := range u.auths {
		if a == b {
			u.auths = append(u.auths[:i], u.auths[i+1:]...)
			return true
		}
	}
	return false
}

func (u *User) GetAuthByProvider(provider string) *Auth {
	if u == nil || u.auths == nil {
		return nil
	}
	for _, b := range u.auths {
		if provider == b.Provider {
			return &b
		}
	}
	return nil
}

func (u *User) RemoveAuthByProvider(provider string) bool {
	if u == nil || provider == "auth0" {
		return false
	}
	for i, b := range u.auths {
		if provider == b.Provider {
			u.auths = append(u.auths[:i], u.auths[i+1:]...)
			return true
		}
	}
	return false
}

func (u *User) ClearAuths() {
	u.auths = []Auth{}
}

func (u *User) SetPassword(pass string) error {
	if err := validatePassword(pass); err != nil {
		return err
	}
	p, err := encodePassword(pass)
	if err != nil {
		return err
	}
	u.password = p
	return nil
}

func (u *User) MatchPassword(pass string) (bool, error) {
	if u == nil || len(u.password) == 0 {
		return false, nil
	}
	return verifyPassword(pass, u.password)
}

func encodePassword(pass string) ([]byte, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(pass), 14)
	return bytes, err
}

func verifyPassword(toVerify string, encoded []byte) (bool, error) {
	err := bcrypt.CompareHashAndPassword(encoded, []byte(toVerify))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return false, nil
		}
		return false, err
	}
	return true, nil
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

func validatePassword(pass string) error {
	var hasNum, hasUpper, hasLower bool
	for _, c := range pass {
		switch {
		case unicode.IsNumber(c):
			hasNum = true
		case unicode.IsUpper(c):
			hasUpper = true
		case unicode.IsLower(c) || c == ' ':
			hasLower = true
		}
	}
	if len(pass) < 8 {
		return ErrPasswordLength
	}
	if !hasLower {
		return ErrPasswordLower
	}
	if !hasUpper {
		return ErrPasswordUpper
	}
	if !hasNum {
		return ErrPasswordNumber
	}

	return nil
}
