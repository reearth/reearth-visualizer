package http

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/adapter"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
	"golang.org/x/text/language"
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
	Sub      *string       `json:"sub"`
	Secret   *string       `json:"secret"`
	UserID   *id.UserID    `json:"userId"`
	TeamID   *id.TeamID    `json:"teamId"`
	Name     *string       `json:"username"`
	Email    *string       `json:"email"`
	Password *string       `json:"password"`
	Theme    *user.Theme   `json:"theme"`
	Lang     *language.Tag `json:"lang"`
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

func (c *UserController) Signup(ctx context.Context, input SignupInput) (SignupOutput, error) {
	var u *user.User
	var err error

	if au := adapter.GetAuthInfo(ctx); au != nil {
		var name string
		if input.Name != nil {
			name = *input.Name
		}

		u, _, err = c.usecase.SignupOIDC(ctx, interfaces.SignupOIDCParam{
			Sub:         au.Sub,
			AccessToken: au.Token,
			Issuer:      au.Iss,
			Email:       au.Email,
			Name:        name,
			Secret:      input.Secret,
			User: interfaces.SignupUserParam{
				UserID: input.UserID,
				TeamID: input.TeamID,
				Lang:   input.Lang,
				Theme:  input.Theme,
			},
		})
	} else if input.Name != nil && input.Email != nil {
		u, _, err = c.usecase.Signup(ctx, interfaces.SignupParam{
			Sub:      input.Sub,
			Name:     *input.Name,
			Email:    *input.Email,
			Password: input.Password,
			Secret:   input.Secret,
			User: interfaces.SignupUserParam{
				UserID: input.UserID,
				TeamID: input.TeamID,
				Lang:   input.Lang,
				Theme:  input.Theme,
			},
		})
	} else {
		err = errors.New("invalid params")
	}

	if err != nil {
		return SignupOutput{}, err
	}

	return SignupOutput{
		ID:    u.ID().String(),
		Name:  u.Name(),
		Email: u.Email(),
	}, nil
}

func (c *UserController) CreateVerification(ctx context.Context, input CreateVerificationInput) error {
	return c.usecase.CreateVerification(ctx, input.Email)
}

func (c *UserController) VerifyUser(ctx context.Context, code string) (VerifyUserOutput, error) {
	u, err := c.usecase.VerifyUser(ctx, code)
	if err != nil {
		return VerifyUserOutput{}, err
	}
	return VerifyUserOutput{
		UserID:   u.ID().String(),
		Verified: u.Verification().IsVerified(),
	}, nil
}

func (c *UserController) StartPasswordReset(ctx context.Context, input PasswordResetInput) error {
	return c.usecase.StartPasswordReset(ctx, input.Email)
}

func (c *UserController) PasswordReset(ctx context.Context, input PasswordResetInput) error {
	return c.usecase.PasswordReset(ctx, input.Password, input.Token)
}
