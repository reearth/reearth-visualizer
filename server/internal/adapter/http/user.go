package http

import (
	"context"

	"golang.org/x/text/language"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsInterfaces "github.com/reearth/reearth-accounts/server/pkg/interfaces/usecase"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

type UserController struct {
	usecase accountsInterfaces.UserUseCase
}

func NewUserController(usecase accountsInterfaces.UserUseCase) *UserController {
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
	Sub         *string                 `json:"sub"`
	Secret      *string                 `json:"secret"`
	UserID      *accountsID.UserID      `json:"userId"`
	WorkspaceID *accountsID.WorkspaceID `json:"workspaceId"`
	TeamID      *accountsID.WorkspaceID `json:"teamId"` // TeamID is an alias of WorkspaceID
	Name        string                  `json:"name"`
	Username    string                  `json:"username"` // ysername is an alias of Name
	Email       string                  `json:"email"`
	Password    string                  `json:"password"`
	Theme       *accountsUser.Theme     `json:"theme"`
	Lang        *language.Tag           `json:"lang"`
}

type CreateVerificationInput struct {
	Email string `json:"email"`
}

type VerifyUserOutput struct {
	UserID   string `json:"userId"`
	Verified bool   `json:"verified"`
}

type SignupOutput struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
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
