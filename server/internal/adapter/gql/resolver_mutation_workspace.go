package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {

	// Deprecated: This function is deprecated and will be replaced by AccountsUsecases in the future.
	res, err := usecases(ctx).Workspace.Create(ctx, input.Name, getUser(ctx).ID(), input.Alias, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	auc := accountsUsecases(ctx)
	if auc != nil && auc.Workspace != nil {
		alias := ""
		if input.Alias != nil {
			alias = *input.Alias
		}
		_, err = auc.Workspace.Create(ctx, alias, input.Name, "", getAccountsUser(ctx).ID(), getAccountsOperator(ctx))
		if err != nil {
			return nil, err
		}
	}

	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Workspace.Remove(ctx, tid, getAcOperator(ctx)); err != nil {
		return nil, err
	}

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	auc := accountsUsecases(ctx)
	if auc != nil && auc.Workspace != nil {
		acWsId, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
		if err != nil {
			return nil, err
		}
		if err := auc.Workspace.Remove(ctx, acWsId, getAccountsOperator(ctx)); err != nil {
			return nil, err
		}
	}

	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.Update(ctx, tid, input.Name, input.Alias, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	auc := accountsUsecases(ctx)
	if auc != nil && auc.Workspace != nil {
		acWsId, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
		if err != nil {
			return nil, err
		}
		_, err = auc.Workspace.Update(ctx, acWsId, input.Name, getAccountsOperator(ctx))
		if err != nil {
			return nil, err
		}
	}

	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountdomain.Workspace, accountdomain.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.AddUserMember(ctx, tid, map[accountdomain.UserID]workspace.Role{uid: gqlmodel.FromRole(input.Role)}, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	auc := accountsUsecases(ctx)
	if auc != nil && auc.Workspace != nil {
		acWsId, acUid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
		if err != nil {
			return nil, err
		}
		acRole, err := accountsWorkspace.RoleFrom(string(gqlmodel.FromRole(input.Role)))
		if err != nil {
			return nil, err
		}
		_, err = auc.Workspace.AddUserMember(ctx, acWsId, map[accountsWorkspace.UserID]accountsWorkspace.Role{
			acUid: acRole,
		}, getAccountsOperator(ctx))
		if err != nil {
			return nil, err
		}
	}

	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountdomain.Workspace, accountdomain.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.RemoveUserMember(ctx, tid, uid, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	auc := accountsUsecases(ctx)
	if auc != nil && auc.Workspace != nil {
		acWsId, acUid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
		if err != nil {
			return nil, err
		}
		_, err = auc.Workspace.RemoveUserMember(ctx, acWsId, acUid, getAccountsOperator(ctx))
		if err != nil {
			return nil, err
		}
	}

	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountdomain.Workspace, accountdomain.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.UpdateUserMember(ctx, tid, uid, gqlmodel.FromRole(input.Role), getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	// TODO: We branch depending on whether it's mockuser (import Library) or reearth-accounts (GraphQL).
	// Currently, we are using the import Library approach.
	auc := accountsUsecases(ctx)
	if auc != nil && auc.Workspace != nil {
		acWsId, acUid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
		if err != nil {
			return nil, err
		}
		acRole, err := accountsWorkspace.RoleFrom(string(gqlmodel.FromRole(input.Role)))
		if err != nil {
			return nil, err
		}
		_, err = auc.Workspace.UpdateUserMember(ctx, acWsId, acUid, acRole, getAccountsOperator(ctx))
		if err != nil {
			return nil, err
		}
	}

	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}
