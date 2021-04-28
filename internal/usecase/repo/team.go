package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/user"
)

type Team interface {
	FindByUser(context.Context, id.UserID) ([]*user.Team, error)
	FindByIDs(context.Context, []id.TeamID) ([]*user.Team, error)
	FindByID(context.Context, id.TeamID) (*user.Team, error)
	Save(context.Context, *user.Team) error
	SaveAll(context.Context, []*user.Team) error
	Remove(context.Context, id.TeamID) error
	RemoveAll(context.Context, []id.TeamID) error
}
