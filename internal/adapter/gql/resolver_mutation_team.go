package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *mutationResolver) CreateTeam(ctx context.Context, input gqlmodel.CreateTeamInput) (*gqlmodel.CreateTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	res, err := r.usecases.Team.Create(ctx, input.Name, getUser(ctx).ID())
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) DeleteTeam(ctx context.Context, input gqlmodel.DeleteTeamInput) (*gqlmodel.DeleteTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	if err := r.usecases.Team.Remove(ctx, id.TeamID(input.TeamID), getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteTeamPayload{TeamID: input.TeamID}, nil
}

func (r *mutationResolver) UpdateTeam(ctx context.Context, input gqlmodel.UpdateTeamInput) (*gqlmodel.UpdateTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	res, err := r.usecases.Team.Update(ctx, id.TeamID(input.TeamID), input.Name, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) AddMemberToTeam(ctx context.Context, input gqlmodel.AddMemberToTeamInput) (*gqlmodel.AddMemberToTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	res, err := r.usecases.Team.AddMember(ctx, id.TeamID(input.TeamID), id.UserID(input.UserID), gqlmodel.FromRole(input.Role), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddMemberToTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) RemoveMemberFromTeam(ctx context.Context, input gqlmodel.RemoveMemberFromTeamInput) (*gqlmodel.RemoveMemberFromTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	res, err := r.usecases.Team.RemoveMember(ctx, id.TeamID(input.TeamID), id.UserID(input.UserID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveMemberFromTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}

func (r *mutationResolver) UpdateMemberOfTeam(ctx context.Context, input gqlmodel.UpdateMemberOfTeamInput) (*gqlmodel.UpdateMemberOfTeamPayload, error) {
	exit := trace(ctx)
	defer exit()

	res, err := r.usecases.Team.UpdateMember(ctx, id.TeamID(input.TeamID), id.UserID(input.UserID), gqlmodel.FromRole(input.Role), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateMemberOfTeamPayload{Team: gqlmodel.ToTeam(res)}, nil
}
