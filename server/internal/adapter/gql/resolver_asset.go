package gql

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Asset() AssetResolver {
	return &assetResolver{r}
}

type assetResolver struct{ *Resolver }

func (r *assetResolver) Workspace(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Workspace, error) {
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
