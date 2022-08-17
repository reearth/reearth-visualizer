package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/workspace"
)

type Workspace interface {
	FindByUser(context.Context, workspace.UserID) (workspace.List, error)
	FindByIDs(context.Context, workspace.IDList) (workspace.List, error)
	FindByID(context.Context, workspace.ID) (*workspace.Workspace, error)
	Save(context.Context, *workspace.Workspace) error
	SaveAll(context.Context, []*workspace.Workspace) error
	Remove(context.Context, workspace.ID) error
	RemoveAll(context.Context, workspace.IDList) error
}
