package http

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type UserController struct {
	usecase interfaces.User
}

func NewUserController(usecase interfaces.User) *UserController {
	return &UserController{
		usecase: usecase,
	}
}

type CreateUserInput struct {
	Sub    string     `json:"sub"`
	Secret string     `json:"secret"`
	UserID *id.UserID `json:"userId"`
	TeamID *id.TeamID `json:"teamId"`
}

type CreateUserOutput struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (c *UserController) CreateUser(ctx context.Context, input CreateUserInput) (interface{}, error) {
	u, _, err := c.usecase.Signup(ctx, interfaces.SignupParam{
		Sub:    input.Sub,
		Secret: input.Secret,
		UserID: input.UserID,
		TeamID: input.TeamID,
	})
	if err != nil {
		return nil, err
	}

	return CreateUserOutput{
		ID:    u.ID().String(),
		Name:  u.Name(),
		Email: u.Email(),
	}, nil
}
