package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/user"
)

type Team interface {
	FindByUser(context.Context, id.UserID) (user.TeamList, error)
	FindByIDs(context.Context, id.TeamIDList) (user.TeamList, error)
	FindByID(context.Context, id.TeamID) (*user.Team, error)
	Save(context.Context, *user.Team) error
	SaveAll(context.Context, []*user.Team) error
	Remove(context.Context, id.TeamID) error
	RemoveAll(context.Context, id.TeamIDList) error
}
