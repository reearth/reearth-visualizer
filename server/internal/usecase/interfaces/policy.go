package interfaces

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/policy"
)

type Policy interface {
	GetWorkspacePolicy(ctx context.Context, workspaceID accountsID.WorkspaceID) (*policy.WorkspacePolicy, error)
	FetchPolicy(ctx context.Context, ids []policy.ID) ([]*policy.Policy, error)
}
