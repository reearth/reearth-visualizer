package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) User() UserResolver {
	return &userResolver{r}
}

type userResolver struct{ *Resolver }

func (r *userResolver) MyTeam(ctx context.Context, obj *gqlmodel.User) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Team.Load(id.TeamID(obj.MyTeamID))
}

func (r *userResolver) Teams(ctx context.Context, obj *gqlmodel.User) ([]*gqlmodel.Team, error) {
	return loaders(ctx).Team.FindByUser(ctx, id.UserID(obj.ID))
}
