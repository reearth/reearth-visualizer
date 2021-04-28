package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/user"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

var (
	ErrUserInvalidPasswordConfirmation = errors.New("invalid password confirmation")
	ErrUserInvalidLang                 = errors.New("invalid lang")
	ErrSignupInvalidSecret             = errors.New("invalid secret")
)

type SignupParam struct {
	Sub    string
	Name   string
	Email  string
	UserID *id.UserID
	TeamID *id.TeamID
	Secret string
}

type UpdateMeParam struct {
	Name                 *string
	Email                *string
	Lang                 *string
	Theme                *user.Theme
	Password             *string
	PasswordConfirmation *string
}

type User interface {
	Fetch(context.Context, []id.UserID, *usecase.Operator) ([]*user.User, error)
	Signup(context.Context, SignupParam) (*user.User, *user.Team, error)
	UpdateMe(context.Context, UpdateMeParam, *usecase.Operator) (*user.User, error)
	RemoveMyAuth(context.Context, string, *usecase.Operator) (*user.User, error)
	SearchUser(context.Context, string, *usecase.Operator) (*user.User, error)
	DeleteMe(context.Context, id.UserID, *usecase.Operator) error
}
