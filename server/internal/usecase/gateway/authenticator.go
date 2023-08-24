package gateway

import (
	"context"

	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
)

type Authenticator interface {
	UpdateUser(context.Context, accountgateway.AuthenticatorUpdateUserParam) (accountgateway.AuthenticatorUser, error)
}
