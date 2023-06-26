package repo

import (
	"context"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

type Policy interface {
	FindByID(context.Context, workspace.PolicyID) (*workspace.Policy, error)
	FindByIDs(context.Context, []workspace.PolicyID) ([]*workspace.Policy, error)
}
