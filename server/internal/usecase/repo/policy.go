package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/workspace"
)

type Policy interface {
	FindByID(context.Context, workspace.PolicyID) (*workspace.Policy, error)
}
