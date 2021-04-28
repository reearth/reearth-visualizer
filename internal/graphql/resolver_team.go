package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Team() TeamResolver {
	return &teamResolver{r}
}

func (r *Resolver) TeamMember() TeamMemberResolver {
	return &teamMemberResolver{r}
}

type teamResolver struct{ *Resolver }

func (r *teamResolver) Assets(ctx context.Context, obj *graphql1.Team, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.AssetConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.AssetController.FindByTeam(ctx, obj.ID, first, last, before, after, getOperator(ctx))
}

func (r *teamResolver) Projects(ctx context.Context, obj *graphql1.Team, includeArchived *bool, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.ProjectConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.ProjectController.FindByTeam(ctx, id.TeamID(obj.ID), first, last, before, after, getOperator(ctx))
}

type teamMemberResolver struct{ *Resolver }

func (r *teamMemberResolver) User(ctx context.Context, obj *graphql1.TeamMember) (*graphql1.User, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).User.Load(id.UserID(obj.UserID))
}
