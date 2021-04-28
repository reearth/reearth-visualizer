package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) User() UserResolver {
	return &userResolver{r}
}

type userResolver struct{ *Resolver }

func (r *userResolver) MyTeam(ctx context.Context, obj *graphql1.User) (*graphql1.Team, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Team.Load(id.TeamID(obj.MyTeamID))
}

func (r *userResolver) Teams(ctx context.Context, obj *graphql1.User) ([]*graphql1.Team, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.TeamController.FindByUser(ctx, id.UserID(obj.ID), getOperator(ctx))
}
