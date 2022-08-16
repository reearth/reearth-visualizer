package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Me() MeResolver {
	return &meResolver{r}
}

type meResolver struct{ *Resolver }

func (r *meResolver) MyTeam(ctx context.Context, obj *gqlmodel.Me) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Team.Load(obj.MyTeamID)
}

func (r *meResolver) Teams(ctx context.Context, obj *gqlmodel.Me) ([]*gqlmodel.Team, error) {
	return loaders(ctx).Team.FindByUser(ctx, obj.ID)
}
