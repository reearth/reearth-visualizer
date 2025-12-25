package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/pkg/policy"

	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type Policy interface {
	GetWorkspacePolicy(ctx context.Context, workspaceID accountsWorkspace.ID) (*policy.WorkspacePolicy, error)
}
