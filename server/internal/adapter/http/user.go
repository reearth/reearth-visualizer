package http

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"golang.org/x/text/language"
)

// UserController is currently not used as User/Workspace usecases are commented out
// This will be refactored when the migration from reearthx to reearth-accounts is complete
type UserController struct {
	// usecase accounts_interfaces.User
}

func NewUserController() *UserController {
	return &UserController{
		// usecase: usecase,
	}
}

type PasswordResetInput struct {
	Email    string `json:"email"`
	Token    string `json:"token"`
	Password string `json:"password"`
}

type SignupInput struct {
	Sub         *string         `json:"sub"`
	Secret      *string         `json:"secret"`
	UserID      *id.UserID      `json:"userId"`
	WorkspaceID *id.WorkspaceID `json:"workspaceId"`
	TeamID      *id.WorkspaceID `json:"teamId"` // TeamID is an alias of WorkspaceID
	Name        string          `json:"name"`
	Username    string          `json:"username"` // ysername is an alias of Name
	Email       string          `json:"email"`
	Password    string          `json:"password"`
	Theme       *user.Theme     `json:"theme"`
	Lang        *language.Tag   `json:"lang"`
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

func (c *UserController) Signup(ctx context.Context, input SignupInput) (SignupOutput, error) {
	// TODO: Re-implement when User usecase is available after migration
	// This is currently not used as the user management has been migrated to reearth-accounts
	_ = input
	_ = ctx
	return SignupOutput{}, nil
}

func (c *UserController) CreateVerification(ctx context.Context, input CreateVerificationInput) error {
	// TODO: Re-implement when User usecase is available after migration
	_ = input
	_ = ctx
	return nil
}

func (c *UserController) VerifyUser(ctx context.Context, code string) (VerifyUserOutput, error) {
	// TODO: Re-implement when User usecase is available after migration
	_ = code
	_ = ctx
	return VerifyUserOutput{}, nil
}

func (c *UserController) StartPasswordReset(ctx context.Context, input PasswordResetInput) error {
	// TODO: Re-implement when User usecase is available after migration
	_ = input
	_ = ctx
	return nil
}

func (c *UserController) PasswordReset(ctx context.Context, input PasswordResetInput) error {
	// TODO: Re-implement when User usecase is available after migration
	_ = input
	_ = ctx
	return nil
}
