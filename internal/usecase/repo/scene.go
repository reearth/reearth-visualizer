package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type Scene interface {
	FindByID(context.Context, id.SceneID, []id.TeamID) (*scene.Scene, error)
	FindByIDs(context.Context, []id.SceneID, []id.TeamID) (scene.List, error)
	FindByTeam(context.Context, ...id.TeamID) (scene.List, error)
	FindByProject(context.Context, id.ProjectID, []id.TeamID) (*scene.Scene, error)
	Save(context.Context, *scene.Scene) error
	Remove(context.Context, id.SceneID) error
}
