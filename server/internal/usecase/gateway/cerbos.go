package gateway

import (
	"context"

	"github.com/cerbos/cerbos-sdk-go/cerbos"
)

type CerbosGateway interface {
	CheckPermissions(ctx context.Context, principal *cerbos.Principal, resources []*cerbos.Resource, actions []string) (*cerbos.CheckResourcesResponse, error)
}
