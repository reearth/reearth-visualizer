package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/util"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func (r *Resolver) Me() MeResolver {
	return &meResolver{r}
}

type meResolver struct{ *Resolver }

func (r *meResolver) MyWorkspace(ctx context.Context, obj *gqlmodel.Me) (*gqlmodel.Workspace, error) {
	if obj.MyWorkspaceID == "" {
		// No workspace ID means no workspace (e.g., mock user)
		return nil, nil
	}
	return dataloaders(ctx).Workspace.Load(obj.MyWorkspaceID)
}

func (r *meResolver) Workspaces(ctx context.Context, obj *gqlmodel.Me) ([]*gqlmodel.Workspace, error) {

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	uc := usecases(ctx)
	if uc.AccountsWorkspace != nil {
		userId, err := gqlmodel.ToID[accountsID.User](obj.ID)
		if err != nil {
			return nil, err
		}

		workspaces, err := uc.AccountsWorkspace.FindByUser(ctx, userId, getAccountsOperator(ctx))
		if err != nil {
			return nil, err
		}
		return util.Map(workspaces, gqlmodel.ToWorkspaceFromAccounts), nil
	}

	// Fallback to reearthx workspace system
	return loaders(ctx).Workspace.FindByUser(ctx, obj.ID)
}
