package gateway

import "context"

type AuthenticatorUpdateUserParam struct {
	ID       string
	Name     *string
	Email    *string
	Password *string
}

type AuthenticatorUser struct {
	ID            string
	Name          string
	Email         string
	EmailVerified bool
}

type Authenticator interface {
	UpdateUser(context.Context, AuthenticatorUpdateUserParam) (AuthenticatorUser, error)
}
