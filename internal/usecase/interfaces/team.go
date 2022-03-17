package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
)

var (
	ErrOwnerCannotLeaveTheTeam = errors.New("owner user cannot leave from the team")
	ErrCannotChangeOwnerRole   = errors.New("cannot change the role of the team owner")
	ErrCannotDeleteTeam        = errors.New("cannot delete team because at least one project is left")
)

type Team interface {
	Fetch(context.Context, []id.TeamID, *usecase.Operator) ([]*user.Team, error)
	FindByUser(context.Context, id.UserID, *usecase.Operator) ([]*user.Team, error)
	Create(context.Context, string, id.UserID, *usecase.Operator) (*user.Team, error)
	Update(context.Context, id.TeamID, string, *usecase.Operator) (*user.Team, error)
	AddMember(context.Context, id.TeamID, id.UserID, user.Role, *usecase.Operator) (*user.Team, error)
	RemoveMember(context.Context, id.TeamID, id.UserID, *usecase.Operator) (*user.Team, error)
	UpdateMember(context.Context, id.TeamID, id.UserID, user.Role, *usecase.Operator) (*user.Team, error)
	Remove(context.Context, id.TeamID, *usecase.Operator) error
}
