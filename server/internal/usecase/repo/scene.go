package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type Scene interface {
	Filtered(WorkspaceFilter) Scene
	FindByID(context.Context, id.SceneID) (*scene.Scene, error)
	FindByIDs(context.Context, id.SceneIDList) (scene.List, error)
	FindByWorkspace(context.Context, ...accountsID.WorkspaceID) (scene.List, error)
	FindByProject(context.Context, id.ProjectID) (*scene.Scene, error)
	FindByProjects(context.Context, []id.ProjectID) ([]*scene.Scene, error)
	Save(context.Context, *scene.Scene) error
	Remove(context.Context, id.SceneID) error
}
