package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type SceneLock interface {
	GetLock(context.Context, id.SceneID) (scene.LockMode, error)
	GetAllLock(context.Context, []id.SceneID) ([]scene.LockMode, error)
	SaveLock(context.Context, id.SceneID, scene.LockMode) error
	ReleaseAllLock(context.Context) error
}
