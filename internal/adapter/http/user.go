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

type PasswordResetInput struct {
	Email    string `json:"email"`
	Token    string `json:"token"`
	Password string `json:"password"`
}

type SignupInput struct {
	Sub      *string    `json:"sub"`
	Secret   *string    `json:"secret"`
	UserID   *id.UserID `json:"userId"`
	TeamID   *id.TeamID `json:"teamId"`
	Name     *string    `json:"username"`
	Email    *string    `json:"email"`
	Password *string    `json:"password"`
}

type CreateVerificationInput struct {
	Email string `json:"email"`
}

type VerifyUserOutput struct {
	UserID   string `json:"userId"`
	Verified bool   `json:"verified"`
}

type CreateUserInput struct {
	Sub    string     `json:"sub"`
	Secret string     `json:"secret"`
	UserID *id.UserID `json:"userId"`
	TeamID *id.TeamID `json:"teamId"`
}

type SignupOutput struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (c *UserController) Signup(ctx context.Context, input SignupInput) (interface{}, error) {
	u, _, err := c.usecase.Signup(ctx, interfaces.SignupParam{
		Sub:      input.Sub,
		Secret:   input.Secret,
		UserID:   input.UserID,
		TeamID:   input.TeamID,
		Name:     input.Name,
		Email:    input.Email,
		Password: input.Password,
	})
	if err != nil {
		return nil, err
	}
	if err := c.usecase.CreateVerification(ctx, *input.Email); err != nil {
		return nil, err
	}

	return SignupOutput{
		ID:    u.ID().String(),
		Name:  u.Name(),
		Email: u.Email(),
	}, nil
}

func (c *UserController) CreateVerification(ctx context.Context, input CreateVerificationInput) error {
	if err := c.usecase.CreateVerification(ctx, input.Email); err != nil {
		return err
	}
	return nil
}

func (c *UserController) VerifyUser(ctx context.Context, code string) (interface{}, error) {
	u, err := c.usecase.VerifyUser(ctx, code)
	if err != nil {
		return nil, err
	}
	return VerifyUserOutput{
		UserID:   u.ID().String(),
		Verified: u.Verification().IsVerified(),
	}, nil
}

func (c *UserController) StartPasswordReset(ctx context.Context, input PasswordResetInput) error {
	err := c.usecase.StartPasswordReset(ctx, input.Email)
	if err != nil {
		return err
	}

	return nil
}

func (c *UserController) PasswordReset(ctx context.Context, input PasswordResetInput) error {
	return c.usecase.PasswordReset(ctx, input.Password, input.Token)
}
