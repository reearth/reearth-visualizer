package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountusecase"
)

type Policy interface {
	FetchPolicy(context.Context, []policy.ID, *accountusecase.Operator) ([]*policy.Policy, error)
}
