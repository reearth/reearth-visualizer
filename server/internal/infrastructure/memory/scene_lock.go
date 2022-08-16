package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
)

type sceneLock struct {
	lock sync.Map
}

func NewSceneLock() repo.SceneLock {
	return &sceneLock{}
}

func (r *sceneLock) GetLock(ctx context.Context, sceneID id.SceneID) (scene.LockMode, error) {
	if sceneID.IsNil() {
		return "", id.ErrInvalidID
	}
	if v, ok := r.lock.Load(sceneID); ok {
		if v2, ok2 := v.(scene.LockMode); ok2 {
			return v2, nil
		}
	}
	return scene.LockModeFree, nil
}

func (r *sceneLock) GetAllLock(ctx context.Context, sceneID id.SceneIDList) ([]scene.LockMode, error) {
	res := make([]scene.LockMode, 0, len(sceneID))
	for _, si := range sceneID {
		if si.IsNil() {
			return nil, id.ErrInvalidID
		}
		if v, ok := r.lock.Load(si); ok {
			if v2, ok2 := v.(scene.LockMode); ok2 {
				res = append(res, v2)
			} else {
				res = append(res, scene.LockModeFree)
			}
		} else {
			res = append(res, scene.LockModeFree)
		}
	}
	return res, nil
}

func (r *sceneLock) SaveLock(ctx context.Context, sceneID id.SceneID, lock scene.LockMode) error {
	if lock == scene.LockModeFree {
		r.lock.Delete(sceneID)
	} else {
		r.lock.Store(sceneID, lock)
	}
	return nil
}

func (r *sceneLock) ReleaseAllLock(ctx context.Context) error {
	r.lock.Range(func(key interface{}, value interface{}) bool {
		r.lock.Delete(key)
		return true
	})
	return nil
}
