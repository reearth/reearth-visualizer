package gql

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/pkg/visualizer"
)

func (r *Resolver) Me() MeResolver {
	return &meResolver{r}
}

type meResolver struct{ *Resolver }

func (r *meResolver) MyWorkspace(ctx context.Context, obj *gqlmodel.Me) (*gqlmodel.Workspace, error) {
	if obj.MyWorkspaceID == "" {
		errMsg := fmt.Sprintf("MyWorkspaceID not found Me.ID: %s", obj.ID)
		return nil, visualizer.ErrorWithCallerLogging(ctx, errMsg, errors.New(errMsg))
	}
	return dataloaders(ctx).Workspace.Load(obj.MyWorkspaceID)
}

func (r *meResolver) Workspaces(ctx context.Context, obj *gqlmodel.Me) ([]*gqlmodel.Workspace, error) {
	return loaders(ctx).Workspace.FindByUser(ctx, obj.ID)
}
