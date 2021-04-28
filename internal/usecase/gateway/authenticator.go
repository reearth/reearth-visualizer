package gateway

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
	FetchUser(string) (AuthenticatorUser, error)
	UpdateUser(AuthenticatorUpdateUserParam) (AuthenticatorUser, error)
}
