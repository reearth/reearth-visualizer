package gateway

import "github.com/reearth/reearthx/account/accountusecase/accountgateway"

type Authenticator interface {
	UpdateUser(accountgateway.AuthenticatorUpdateUserParam) (accountgateway.AuthenticatorUser, error)
}
