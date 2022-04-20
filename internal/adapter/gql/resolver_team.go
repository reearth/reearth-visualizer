package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase"
)

func (r *Resolver) Team() TeamResolver {
	return &teamResolver{r}
}

func (r *Resolver) TeamMember() TeamMemberResolver {
	return &teamMemberResolver{r}
}

type teamResolver struct{ *Resolver }

func (r *teamResolver) Assets(ctx context.Context, obj *gqlmodel.Team, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByTeam(ctx, obj.ID, nil, nil, &gqlmodel.Pagination{
		First:  first,
		Last:   last,
		After:  after,
		Before: before,
	})
}

func (r *teamResolver) Projects(ctx context.Context, obj *gqlmodel.Team, includeArchived *bool, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByTeam(ctx, obj.ID, first, last, before, after)
}

type teamMemberResolver struct{ *Resolver }

func (r *teamMemberResolver) User(ctx context.Context, obj *gqlmodel.TeamMember) (*gqlmodel.User, error) {
	return dataloaders(ctx).User.Load(obj.UserID)
}
