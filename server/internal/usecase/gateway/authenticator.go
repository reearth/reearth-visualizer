package gateway

import "github.com/reearth/reearthx/account/accountusecase/accountgateway"

type Authenticator interface {
	UpdateUser(ctx context.Context,accountgateway.AuthenticatorUpdateUserParam) (accountgateway.AuthenticatorUser, error)
}
