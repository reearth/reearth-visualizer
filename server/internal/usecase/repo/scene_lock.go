package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
)

type SceneLock interface {
	GetLock(context.Context, id.SceneID) (scene.LockMode, error)
	GetAllLock(context.Context, id.SceneIDList) ([]scene.LockMode, error)
	SaveLock(context.Context, id.SceneID, scene.LockMode) error
	ReleaseAllLock(context.Context) error
}
