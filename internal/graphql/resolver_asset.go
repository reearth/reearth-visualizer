package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Asset() AssetResolver {
	return &assetResolver{r}
}

type assetResolver struct{ *Resolver }

func (r *assetResolver) Team(ctx context.Context, obj *graphql1.Asset) (*graphql1.Team, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Team.Load(id.TeamID(obj.TeamID))
}
