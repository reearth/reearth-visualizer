package gql

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/util"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func (r *Resolver) Me() MeResolver {
	return &meResolver{r}
}

type meResolver struct{ *Resolver }

func (r *meResolver) MyWorkspace(ctx context.Context, obj *gqlmodel.Me) (*gqlmodel.Workspace, error) {
	if obj.MyWorkspaceID == "" {
		errMsg := fmt.Sprintf("MyWorkspaceID not found Me.ID: %s", obj.ID)
		return nil, visualizer.ErrorWithCallerLogging(ctx, errMsg, errors.New(errMsg))
	}

	if r.AccountsAPIClient != nil {
		user := getUser(ctx)
		if user == nil {
			return nil, errors.New("user not found in context")
		}

		workspaces, err := r.AccountsAPIClient.WorkspaceRepo.FindByUser(ctx, user.ID().String())
		if err != nil {
			return nil, err
		}

		workspaceID, err := gqlmodel.ToID[accountsID.Workspace](obj.MyWorkspaceID)
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

func (r *meResolver) Workspaces(ctx context.Context, obj *gqlmodel.Me) ([]*gqlmodel.Workspace, error) {
	userId, err := gqlmodel.ToID[accountsID.User](obj.ID)
	if err != nil {
		return nil, err
	}

	if r.AccountsAPIClient != nil {
		workspaces, err := r.AccountsAPIClient.WorkspaceRepo.FindByUser(ctx, userId.String())
		if err != nil {
			return nil, err
		}
		return util.Map(workspaces, gqlmodel.ToWorkspaceFromAccounts), nil
	}

	return nil, errors.New("accounts API client not available")
}
