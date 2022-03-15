package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type Scene interface {
	Filtered(TeamFilter) Scene
	FindByID(context.Context, id.SceneID) (*scene.Scene, error)
	FindByIDs(context.Context, []id.SceneID) (scene.List, error)
	FindByTeam(context.Context, ...id.TeamID) (scene.List, error)
	FindByProject(context.Context, id.ProjectID) (*scene.Scene, error)
	Save(context.Context, *scene.Scene) error
	Remove(context.Context, id.SceneID) error
}
