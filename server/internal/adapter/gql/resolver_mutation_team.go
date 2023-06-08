package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

func (r *mutationResolver) CreateTeam(ctx context.Context, input gqlmodel.CreateTeamInput) (*gqlmodel.CreateTeamPayload, error) {
	res, err := usecases(ctx).Workspace.Create(ctx, input.Name, getUser(ctx).ID(), getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateTeamPayload{Team: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) DeleteTeam(ctx context.Context, input gqlmodel.DeleteTeamInput) (*gqlmodel.DeleteTeamPayload, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](input.TeamID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Workspace.Remove(ctx, tid, getAcOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteTeamPayload{TeamID: input.TeamID}, nil
}

func (r *mutationResolver) UpdateTeam(ctx context.Context, input gqlmodel.UpdateTeamInput) (*gqlmodel.UpdateTeamPayload, error) {
	tid, err := gqlmodel.ToID[accountdomain.Workspace](input.TeamID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.Update(ctx, tid, input.Name, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateTeamPayload{Team: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) AddMemberToTeam(ctx context.Context, input gqlmodel.AddMemberToTeamInput) (*gqlmodel.AddMemberToTeamPayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountdomain.Workspace, accountdomain.User](input.TeamID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.AddUserMember(ctx, tid, map[accountdomain.UserID]workspace.Role{uid: gqlmodel.FromRole(input.Role)}, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddMemberToTeamPayload{Team: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) RemoveMemberFromTeam(ctx context.Context, input gqlmodel.RemoveMemberFromTeamInput) (*gqlmodel.RemoveMemberFromTeamPayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountdomain.Workspace, accountdomain.User](input.TeamID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.RemoveUserMember(ctx, tid, uid, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveMemberFromTeamPayload{Team: gqlmodel.ToWorkspace(res)}, nil
}

func (r *mutationResolver) UpdateMemberOfTeam(ctx context.Context, input gqlmodel.UpdateMemberOfTeamInput) (*gqlmodel.UpdateMemberOfTeamPayload, error) {
	tid, uid, err := gqlmodel.ToID2[accountdomain.Workspace, accountdomain.User](input.TeamID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Workspace.UpdateUserMember(ctx, tid, uid, gqlmodel.FromRole(input.Role), getAcOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMemberOfTeamPayload{Team: gqlmodel.ToWorkspace(res)}, nil
}
