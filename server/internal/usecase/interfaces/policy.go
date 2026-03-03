package interfaces

import (
	"context"

	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/pkg/policy"
)

type Policy interface {
	GetWorkspacePolicy(ctx context.Context, workspaceID accountsWorkspace.ID) (*policy.WorkspacePolicy, error)
}
