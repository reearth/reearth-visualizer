package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/pkg/id"
)

func (r *mutationResolver) CreateTeam(ctx context.Context, input gqlmodel.CreateTeamInput) (*gqlmodel.CreateTeamPayload, error) {
	res, err := usecases(ctx).Team.Create(ctx, input.Name, getUser(ctx).ID(), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) DeleteTeam(ctx context.Context, input gqlmodel.DeleteTeamInput) (*gqlmodel.DeleteTeamPayload, error) {
	tid, err := gqlmodel.ToID[id.Team](input.TeamID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Team.Remove(ctx, tid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteTeamPayload{TeamID: input.TeamID}, nil
}

func (r *mutationResolver) UpdateTeam(ctx context.Context, input gqlmodel.UpdateTeamInput) (*gqlmodel.UpdateTeamPayload, error) {
	tid, err := gqlmodel.ToID[id.Team](input.TeamID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Team.Update(ctx, tid, input.Name, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) AddMemberToTeam(ctx context.Context, input gqlmodel.AddMemberToTeamInput) (*gqlmodel.AddMemberToTeamPayload, error) {
	tid, uid, err := gqlmodel.ToID2[id.Team, id.User](input.TeamID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Team.AddMember(ctx, tid, uid, gqlmodel.FromRole(input.Role), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddMemberToTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) RemoveMemberFromTeam(ctx context.Context, input gqlmodel.RemoveMemberFromTeamInput) (*gqlmodel.RemoveMemberFromTeamPayload, error) {
	tid, uid, err := gqlmodel.ToID2[id.Team, id.User](input.TeamID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Team.RemoveMember(ctx, tid, uid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveMemberFromTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) UpdateMemberOfTeam(ctx context.Context, input gqlmodel.UpdateMemberOfTeamInput) (*gqlmodel.UpdateMemberOfTeamPayload, error) {
	tid, uid, err := gqlmodel.ToID2[id.Team, id.User](input.TeamID, input.UserID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Team.UpdateMember(ctx, tid, uid, gqlmodel.FromRole(input.Role), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMemberOfTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}
