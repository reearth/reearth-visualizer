package gateway

import (
	"context"

	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
)

type Authenticator interface {
	UpdateUser(context.Context, accountsGateway.AuthenticatorUpdateUserParam) (accountsGateway.AuthenticatorUser, error)
}
