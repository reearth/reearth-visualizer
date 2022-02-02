package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Asset() AssetResolver {
	return &assetResolver{r}
}

type assetResolver struct{ *Resolver }

func (r *assetResolver) Team(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Team.Load(id.TeamID(obj.TeamID))
}
