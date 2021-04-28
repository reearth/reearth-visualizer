package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
)

type TeamControllerConfig struct {
	TeamInput func() interfaces.Team
}

type TeamController struct {
	config TeamControllerConfig
}

func NewTeamController(config TeamControllerConfig) *TeamController {
	return &TeamController{config: config}
}

func (c *TeamController) usecase() interfaces.Team {
	if c == nil {
		return nil
	}
	return c.config.TeamInput()
}

func (c *TeamController) Create(ctx context.Context, i *CreateTeamInput, u *user.User) (*CreateTeamPayload, error) {
	res, err := c.usecase().Create(ctx, i.Name, u.ID())
	if err != nil {
		return nil, err
	}

	return &CreateTeamPayload{Team: toTeam(res)}, nil
}

func (c *TeamController) Update(ctx context.Context, i *UpdateTeamInput, o *usecase.Operator) (*UpdateTeamPayload, error) {
	res, err := c.usecase().Update(ctx, id.TeamID(i.TeamID), i.Name, o)
	if err != nil {
		return nil, err
	}

	return &UpdateTeamPayload{Team: toTeam(res)}, nil
}

func (c *TeamController) AddMember(ctx context.Context, i *AddMemberToTeamInput, o *usecase.Operator) (*AddMemberToTeamPayload, error) {
	res, err := c.usecase().AddMember(ctx, id.TeamID(i.TeamID), id.UserID(i.UserID), fromRole(i.Role), o)
	if err != nil {
		return nil, err
	}

	return &AddMemberToTeamPayload{Team: toTeam(res)}, nil
}

func (c *TeamController) RemoveMember(ctx context.Context, i *RemoveMemberFromTeamInput, o *usecase.Operator) (*RemoveMemberFromTeamPayload, error) {
	res, err := c.usecase().RemoveMember(ctx, id.TeamID(i.TeamID), id.UserID(i.UserID), o)
	if err != nil {
		return nil, err
	}

	return &RemoveMemberFromTeamPayload{Team: toTeam(res)}, nil
}

func (c *TeamController) UpdateMember(ctx context.Context, i *UpdateMemberOfTeamInput, o *usecase.Operator) (*UpdateMemberOfTeamPayload, error) {
	res, err := c.usecase().UpdateMember(ctx, id.TeamID(i.TeamID), id.UserID(i.UserID), fromRole(i.Role), o)
	if err != nil {
		return nil, err
	}

	return &UpdateMemberOfTeamPayload{Team: toTeam(res)}, nil
}

func (c *TeamController) Remove(ctx context.Context, team id.ID, o *usecase.Operator) (*DeleteTeamPayload, error) {
	if err := c.usecase().Remove(ctx, id.TeamID(team), o); err != nil {
		return nil, err
	}

	return &DeleteTeamPayload{TeamID: team}, nil
}
