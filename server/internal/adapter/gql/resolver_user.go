package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/log"
)

func (r *Resolver) Me() MeResolver {
	return &meResolver{r}
}

type meResolver struct{ *Resolver }

func (r *meResolver) MyWorkspace(ctx context.Context, obj *gqlmodel.Me) (*gqlmodel.Workspace, error) {
	if obj.MyWorkspaceID == "" {
		log.Errorfc(ctx, "MyWorkspaceID not found Me.ID: %s", obj.ID)
	}
	return dataloaders(ctx).Workspace.Load(obj.MyWorkspaceID)
}

func (r *meResolver) Workspaces(ctx context.Context, obj *gqlmodel.Me) ([]*gqlmodel.Workspace, error) {
	return loaders(ctx).Workspace.FindByUser(ctx, obj.ID)
}
