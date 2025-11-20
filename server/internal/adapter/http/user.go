package http

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"

	"golang.org/x/text/language"
)

var ErrNotImplemented = errors.New("functionality not yet implemented with new account repos")

type UserController struct {
	repo accountsRepo.User
}

func NewUserController(repo accountsRepo.User) *UserController {
	return &UserController{
		repo: repo,
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

func (c *UserController) Signup(ctx context.Context, input SignupInput) (SignupOutput, error) {
	if input.Name == "" && input.Username != "" {
		input.Name = input.Username
	}
	if input.WorkspaceID == nil && input.TeamID != nil {
		input.WorkspaceID = input.TeamID
	}

	// TODO: Implement signup functionality using the new account repos
	// This requires implementing the full signup flow including:
	// - Creating users with Create()
	// - Managing workspaces
	// - Handling OIDC authentication
	// - Password hashing and verification
	return SignupOutput{}, ErrNotImplemented
}

func (c *UserController) CreateVerification(ctx context.Context, input CreateVerificationInput) error {
	// TODO: Implement CreateVerification in gqlclient
	return nil
}

func (c *UserController) VerifyUser(ctx context.Context, code string) (VerifyUserOutput, error) {
	// TODO: Implement VerifyUser in gqlclient
	return VerifyUserOutput{}, nil
}

func (c *UserController) StartPasswordReset(ctx context.Context, input PasswordResetInput) error {
	// TODO: Implement StartPasswordReset in gqlclient
	return nil
}

func (c *UserController) PasswordReset(ctx context.Context, input PasswordResetInput) error {
	// TODO: Implement PasswordReset in gqlclient
	return nil
}
