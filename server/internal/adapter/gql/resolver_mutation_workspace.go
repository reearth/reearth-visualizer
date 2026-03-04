package gql

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	gqlclientWorkspace "github.com/reearth/reearth-accounts/server/pkg/gqlclient/workspace"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateWorkspace(ctx context.Context, input gqlmodel.CreateWorkspaceInput) (*gqlmodel.CreateWorkspacePayload, error) {
	if r.AccountsAPIClient != nil {
		alias := ""
		if input.Alias != nil {
			alias = *input.Alias
		}
		res, err := r.AccountsAPIClient.WorkspaceRepo.CreateWorkspace(ctx, gqlclientWorkspace.CreateWorkspaceInput{
			Alias: alias,
			Name:  input.Name,
		})
		if err != nil {
			return nil, err
		}
		return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
	}

	// fallback to usecase (e2e tests)
	res, err := usecases(ctx).Workspace.Create(ctx, input.Name, getUser(ctx).ID(), input.Alias, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.CreateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) DeleteWorkspace(ctx context.Context, input gqlmodel.DeleteWorkspaceInput) (*gqlmodel.DeleteWorkspacePayload, error) {
	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if r.AccountsAPIClient != nil {
		if err := r.AccountsAPIClient.WorkspaceRepo.DeleteWorkspace(ctx, tid.String()); err != nil {
			return nil, err
		}
		return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
	}

	// fallback to usecase (e2e tests)
	if err := usecases(ctx).Workspace.Remove(ctx, tid, getAcOperator(ctx)); err != nil {
		return nil, err
	}
	return &gqlmodel.DeleteWorkspacePayload{WorkspaceID: input.WorkspaceID}, nil
}

func (r *mutationResolver) UpdateWorkspace(ctx context.Context, input gqlmodel.UpdateWorkspaceInput) (*gqlmodel.UpdateWorkspacePayload, error) {
	tid, err := gqlmodel.ToID[accountsID.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if r.AccountsAPIClient != nil {
		res, err := r.AccountsAPIClient.WorkspaceRepo.UpdateWorkspace(ctx, gqlclientWorkspace.UpdateWorkspaceInput{
			WorkspaceID: tid.String(),
			Name:        input.Name,
		})
		if err != nil {
			return nil, err
		}
		return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
	}

	// fallback to usecase (e2e tests)
	res, err := usecases(ctx).Workspace.Update(ctx, tid, input.Name, input.Alias, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.UpdateWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) AddMemberToWorkspace(ctx context.Context, input gqlmodel.AddMemberToWorkspaceInput) (*gqlmodel.AddMemberToWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	if r.AccountsAPIClient != nil {
		role := gqlmodel.FromRole(input.Role)
		res, err := r.AccountsAPIClient.WorkspaceRepo.AddUsersToWorkspace(ctx, gqlclientWorkspace.AddUsersToWorkspaceInput{
			WorkspaceID: tid.String(),
			Users: []gqlclientWorkspace.MemberInput{
				{UserID: uid.String(), Role: string(role)},
			},
		})
		if err != nil {
			return nil, err
		}
		return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
	}

	// fallback to usecase (e2e tests)
	res, err := usecases(ctx).Workspace.AddUserMember(ctx, tid, map[accountsID.UserID]accountsRole.RoleType{uid: gqlmodel.FromRole(input.Role)}, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.AddMemberToWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) RemoveMemberFromWorkspace(ctx context.Context, input gqlmodel.RemoveMemberFromWorkspaceInput) (*gqlmodel.RemoveMemberFromWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	if r.AccountsAPIClient != nil {
		res, err := r.AccountsAPIClient.WorkspaceRepo.RemoveUserFromWorkspace(ctx, tid.String(), uid.String())
		if err != nil {
			return nil, err
		}
		return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
	}

	// fallback to usecase (e2e tests)
	res, err := usecases(ctx).Workspace.RemoveUserMember(ctx, tid, uid, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.RemoveMemberFromWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) UpdateMemberOfWorkspace(ctx context.Context, input gqlmodel.UpdateMemberOfWorkspaceInput) (*gqlmodel.UpdateMemberOfWorkspacePayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountsID.Workspace, accountsID.User](input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	if r.AccountsAPIClient != nil {
		role := gqlmodel.FromRole(input.Role)
		res, err := r.AccountsAPIClient.WorkspaceRepo.UpdateUserOfWorkspace(ctx, gqlclientWorkspace.UpdateUserOfWorkspaceInput{
			WorkspaceID: tid.String(),
			UserID:      uid.String(),
			Role:        string(role),
		})
		if err != nil {
			return nil, err
		}
		return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
	}

	// fallback to usecase (e2e tests)
	res, err := usecases(ctx).Workspace.UpdateUserMember(ctx, tid, uid, gqlmodel.FromRole(input.Role), getAcOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.UpdateMemberOfWorkspacePayload{Workspace: gqlmodel.ToWorkspace(res)}, nil
}
