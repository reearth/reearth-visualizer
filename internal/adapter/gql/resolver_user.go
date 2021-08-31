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
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Team.Load(id.TeamID(obj.MyTeamID))
}

func (r *userResolver) Teams(ctx context.Context, obj *gqlmodel.User) ([]*gqlmodel.Team, error) {
	exit := trace(ctx)
	defer exit()

	return r.loaders.Team.FindByUser(ctx, id.UserID(obj.ID))
}
