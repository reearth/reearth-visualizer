package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/pkg/policy"
)

type Policy interface {
	FetchPolicy(ctx context.Context, ids []policy.ID) ([]*policy.Policy, error)
}
