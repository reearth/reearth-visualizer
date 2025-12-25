package gql

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/rerror"
)

func (r *Resolver) Project() ProjectResolver {
	return &projectResolver{r}
}

type projectResolver struct{ *Resolver }

func (r *projectResolver) Workspace(ctx context.Context, obj *gqlmodel.Project) (*gqlmodel.Workspace, error) {
	if r.AccountsAPIClient != nil {
		user := getUser(ctx)
		if user == nil {
			return nil, errors.New("user not found in context")
		}

		workspaces, err := r.AccountsAPIClient.WorkspaceRepo.FindByUser(ctx, user.ID().String())
		if err != nil {
			return nil, err
		}

		workspaceID, err := gqlmodel.ToID[accountsID.Workspace](obj.WorkspaceID)
		if err != nil {
			return nil, err
		}

		workspace := findWorkspaceFromListByID(workspaces, workspaceID.String())
		if workspace == nil {
			return nil, errors.New("workspace not found")
		}

		return gqlmodel.ToWorkspaceFromAccounts(workspace), nil
	}

	return nil, errors.New("accounts API client not available")
}

func (r *projectResolver) Scene(ctx context.Context, obj *gqlmodel.Project) (*gqlmodel.Scene, error) {
	s, err := loaders(ctx).Scene.FindByProject(ctx, obj.ID)
	if err != nil && err != rerror.ErrNotFound {
		return nil, err
	}
	return s, nil
}
