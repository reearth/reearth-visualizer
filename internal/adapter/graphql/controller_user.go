package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type UserControllerConfig struct {
	UserInput func() interfaces.User
}

type UserController struct {
	config UserControllerConfig
}

func NewUserController(config UserControllerConfig) *UserController {
	return &UserController{config: config}
}

func (c *UserController) usecase() interfaces.User {
	if c == nil {
		return nil
	}
	return c.config.UserInput()
}

func (c *UserController) Fetch(ctx context.Context, ids []id.UserID, operator *usecase.Operator) ([]*User, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	users := make([]*User, 0, len(res))
	for _, u := range res {
		users = append(users, ToUser(u))
	}

	return users, nil
}

func (c *UserController) Signup(ctx context.Context, ginput *SignupInput, sub string) (*SignupPayload, error) {
	secret := ""
	if ginput.Secret != nil {
		secret = *ginput.Secret
	}
	u, team, err := c.usecase().Signup(ctx, interfaces.SignupParam{
		Sub:    sub,
		Lang:   ginput.Lang,
		Theme:  toTheme(ginput.Theme),
		UserID: id.UserIDFromRefID(ginput.UserID),
		TeamID: id.TeamIDFromRefID(ginput.TeamID),
		Secret: secret,
	})
	if err != nil {
		return nil, err
	}
	return &SignupPayload{User: ToUser(u), Team: toTeam(team)}, nil
}

func (c *UserController) UpdateMe(ctx context.Context, ginput *UpdateMeInput, operator *usecase.Operator) (*UpdateMePayload, error) {
	res, err := c.usecase().UpdateMe(ctx, interfaces.UpdateMeParam{
		Name:                 ginput.Name,
		Email:                ginput.Email,
		Lang:                 ginput.Lang,
		Theme:                toTheme(ginput.Theme),
		Password:             ginput.Password,
		PasswordConfirmation: ginput.PasswordConfirmation,
	}, operator)
	if err != nil {
		return nil, err
	}

	return &UpdateMePayload{User: ToUser(res)}, nil
}

func (c *UserController) RemoveMyAuth(ctx context.Context, ginput *RemoveMyAuthInput, operator *usecase.Operator) (*UpdateMePayload, error) {
	res, err := c.usecase().RemoveMyAuth(ctx, ginput.Auth, operator)
	if err != nil {
		return nil, err
	}

	return &UpdateMePayload{User: ToUser(res)}, nil
}

func (c *UserController) SearchUser(ctx context.Context, nameOrEmail string, operator *usecase.Operator) (*SearchedUser, error) {
	res, err := c.usecase().SearchUser(ctx, nameOrEmail, operator)
	if err != nil {
		return nil, err
	}

	return toSearchedUser(res), nil
}

func (c *UserController) DeleteMe(ctx context.Context, user id.ID, operator *usecase.Operator) (*DeleteMePayload, error) {
	if err := c.usecase().DeleteMe(ctx, id.UserID(user), operator); err != nil {
		return nil, err
	}

	return &DeleteMePayload{UserID: user}, nil
}
