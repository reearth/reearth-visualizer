package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Asset() AssetResolver {
	return &assetResolver{r}
}

type assetResolver struct{ *Resolver }

func (r *assetResolver) Team(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Workspace.Load(obj.TeamID)
}
