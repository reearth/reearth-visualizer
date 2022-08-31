package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/usecasex"
)

func (r *Resolver) Team() TeamResolver {
	return &teamResolver{r}
}

func (r *Resolver) TeamMember() TeamMemberResolver {
	return &teamMemberResolver{r}
}

type teamResolver struct{ *Resolver }

func (r *teamResolver) Policy(ctx context.Context, obj *gqlmodel.Team) (*gqlmodel.Policy, error) {
	if obj.PolicyID == nil {
		return nil, nil
	}
	return single(loaders(ctx).Policy.Fetch(ctx, []gqlmodel.ID{*obj.PolicyID}))
}

func (r *teamResolver) Assets(ctx context.Context, obj *gqlmodel.Team, first *int, last *int, after *usecasex.Cursor, before *usecasex.Cursor) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByWorkspace(ctx, obj.ID, nil, nil, &gqlmodel.Pagination{
		First:  first,
		Last:   last,
		After:  after,
		Before: before,
	})
}

func (r *teamResolver) Projects(ctx context.Context, obj *gqlmodel.Team, includeArchived *bool, first *int, last *int, after *usecasex.Cursor, before *usecasex.Cursor) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByWorkspace(ctx, obj.ID, first, last, before, after)
}

type teamMemberResolver struct{ *Resolver }

func (r *teamMemberResolver) User(ctx context.Context, obj *gqlmodel.TeamMember) (*gqlmodel.User, error) {
	return dataloaders(ctx).User.Load(obj.UserID)
}
