package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/user"
	"golang.org/x/text/language"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

var (
	ErrUserInvalidPasswordConfirmation = errors.New("invalid password confirmation")
	ErrUserInvalidPasswordReset        = errors.New("invalid password reset request")
	ErrUserInvalidLang                 = errors.New("invalid lang")
	ErrSignupInvalidSecret             = errors.New("invalid secret")
	ErrSignupInvalidName               = errors.New("invalid name")
	ErrInvalidUserEmail                = errors.New("invalid email")
	ErrNotVerifiedUser                 = errors.New("not verified user")
	ErrSignupInvalidPassword           = errors.New("invalid password")
)

type SignupParam struct {
	Sub      *string
	UserID   *id.UserID
	Secret   *string
	Name     *string
	Email    *string
	Password *string
	Lang     *language.Tag
	Theme    *user.Theme
	TeamID   *id.TeamID
}

type GetUserByCredentials struct {
	Email    string
	Password string
}

type UpdateMeParam struct {
	Name                 *string
	Email                *string
	Lang                 *language.Tag
	Theme                *user.Theme
	Password             *string
	PasswordConfirmation *string
}

type User interface {
	Fetch(context.Context, []id.UserID, *usecase.Operator) ([]*user.User, error)
	Signup(context.Context, SignupParam) (*user.User, *user.Team, error)
	CreateVerification(context.Context, string) error
	VerifyUser(context.Context, string) (*user.User, error)
	GetUserByCredentials(context.Context, GetUserByCredentials) (*user.User, error)
	GetUserBySubject(context.Context, string) (*user.User, error)
	StartPasswordReset(context.Context, string) error
	PasswordReset(context.Context, string, string) error
	UpdateMe(context.Context, UpdateMeParam, *usecase.Operator) (*user.User, error)
	RemoveMyAuth(context.Context, string, *usecase.Operator) (*user.User, error)
	SearchUser(context.Context, string, *usecase.Operator) (*user.User, error)
	DeleteMe(context.Context, id.UserID, *usecase.Operator) error
}
