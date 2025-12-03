package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {
	aop, auc := getAccountsOperator(ctx), accountsUsecases(ctx)

	res, err := auc.Workspace.Create(ctx, *input.Alias, input.Name, "description", getAccountsUser(ctx).ID(), aop)

	if err != nil {
		return nil, err
	}

	alias := ""
	if input.Alias != nil {
		alias = *input.Alias
	}
	_, err = auc.Workspace.Create(ctx, alias, input.Name, "", getAccountsUser(ctx).ID(), aop)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {
	aop, auc := getAccountsOperator(ctx), accountsUsecases(ctx)

	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if err := auc.Workspace.Remove(ctx, tid, aop); err != nil {
		return nil, err
	}

	acWsId, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}
	if err := auc.Workspace.Remove(ctx, acWsId, aop); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {
	aop, auc := getAccountsOperator(ctx), accountsUsecases(ctx)

	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	res, err := auc.Workspace.Update(ctx, tid, input.Name /* input.Alias, */, aop)
	if err != nil {
		return nil, err
	}

	acWsId, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}
	_, err = auc.Workspace.Update(ctx, acWsId, input.Name, aop)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {
	aop, auc := getAccountsOperator(ctx), accountsUsecases(ctx)

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := auc.Workspace.AddUserMember(ctx, tid, map[accountsID.UserID]accountsWorkspace.Role{uid: gqlmodel.FromRole(input.Role)}, aop)
	if err != nil {
		return nil, err
	}

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
	}, aop)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {
	aop, auc := getAccountsOperator(ctx), accountsUsecases(ctx)

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := auc.Workspace.RemoveUserMember(ctx, tid, uid, aop)
	if err != nil {
		return nil, err
	}

	acWsId, acUid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}
	_, err = auc.Workspace.RemoveUserMember(ctx, acWsId, acUid, aop)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {
	aop, auc := getAccountsOperator(ctx), accountsUsecases(ctx)

	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := auc.Workspace.UpdateUserMember(ctx, tid, uid, gqlmodel.FromRole(input.Role), aop)
	if err != nil {
		return nil, err
	}

	acWsId, acUid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}
	acRole, err := accountsWorkspace.RoleFrom(string(gqlmodel.FromRole(input.Role)))
	if err != nil {
		return nil, err
	}
	_, err = auc.Workspace.UpdateUserMember(ctx, acWsId, acUid, acRole, aop)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}
