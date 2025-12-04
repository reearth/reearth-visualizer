package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

type Policy interface {
	GetWorkspacePolicy(ctx context.Context, workspaceID workspace.ID) (*policy.WorkspacePolicy, error)
}
