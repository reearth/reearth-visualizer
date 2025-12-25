package gql

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/usecasex"
)

func (r *Resolver) Workspace() WorkspaceResolver {
	return &workspaceResolver{r}
}

func (r *Resolver) WorkspaceMember() WorkspaceMemberResolver {
	return &workspaceMemberResolver{r}
}

type workspaceResolver struct{ *Resolver }

func (r *workspaceResolver) Assets(ctx context.Context, obj *gqlmodel.Workspace, projectID *gqlmodel.ID, first *int, last *int, after *usecasex.Cursor, before *usecasex.Cursor) (*gqlmodel.AssetConnection, error) {
	return loaders(ctx).Asset.FindByWorkspace(ctx, obj.ID, projectID, nil, nil, &gqlmodel.Pagination{
		First:  first,
		Last:   last,
		After:  after,
		Before: before,
	})
}

func (r *workspaceResolver) Projects(ctx context.Context, obj *gqlmodel.Workspace, includeArchived *bool, first *int, last *int, after *usecasex.Cursor, before *usecasex.Cursor) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByWorkspace(ctx, obj.ID, nil, nil, &gqlmodel.Pagination{
		First:  first,
		Last:   last,
		After:  after,
		Before: before,
	})
}

type workspaceMemberResolver struct{ *Resolver }

func (r *workspaceMemberResolver) User(ctx context.Context, obj *gqlmodel.WorkspaceMember) (*gqlmodel.User, error) {
	if r.AccountsAPIClient != nil {
		userID, err := gqlmodel.ToID[accountsID.User](obj.UserID)
		if err != nil {
			return nil, err
		}

		user, err := r.AccountsAPIClient.UserRepo.FindByID(ctx, userID.String())
		if err != nil {
			return nil, err
		}

		return gqlmodel.ToUser(user), nil
	}

	return nil, errors.New("accounts API client not available")
}
