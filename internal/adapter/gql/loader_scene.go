package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type SceneLoader struct {
	usecase interfaces.Scene
}

func NewSceneLoader(usecase interfaces.Scene) *SceneLoader {
	return &SceneLoader{usecase: usecase}
}

func (c *SceneLoader) Fetch(ctx context.Context, ids []id.SceneID) ([]*gqlmodel.Scene, []error) {
	res, err := c.usecase.Fetch(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	scenes := make([]*gqlmodel.Scene, 0, len(res))
	for _, scene := range res {
		scenes = append(scenes, gqlmodel.ToScene(scene))
	}
	return scenes, nil
}

func (c *SceneLoader) FindByProject(ctx context.Context, projectID id.ProjectID) (*gqlmodel.Scene, error) {
	res, err := c.usecase.FindByProject(ctx, projectID, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToScene(res), nil
}

func (c *SceneLoader) FetchLock(ctx context.Context, sid id.SceneID) (*gqlmodel.SceneLockMode, error) {
	res, err := c.usecase.FetchLock(ctx, []id.SceneID{sid}, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	if len(res) > 0 {
		return nil, nil
	}
	sl := gqlmodel.ToSceneLockMode(res[0])
	return &sl, nil
}

func (c *SceneLoader) FetchLockAll(ctx context.Context, sid []id.SceneID) ([]gqlmodel.SceneLockMode, []error) {
	res, err := c.usecase.FetchLock(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	res2 := make([]gqlmodel.SceneLockMode, 0, len(res))
	for _, r := range res {
		res2 = append(res2, gqlmodel.ToSceneLockMode(r))
	}

	return res2, nil
}

// data loader

type SceneDataLoader interface {
	Load(id.SceneID) (*gqlmodel.Scene, error)
	LoadAll([]id.SceneID) ([]*gqlmodel.Scene, []error)
}

func (c *SceneLoader) DataLoader(ctx context.Context) SceneDataLoader {
	return gqldataloader.NewSceneLoader(gqldataloader.SceneLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []id.SceneID) ([]*gqlmodel.Scene, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *SceneLoader) OrdinaryDataLoader(ctx context.Context) SceneDataLoader {
	return &ordinarySceneLoader{
		fetch: func(keys []id.SceneID) ([]*gqlmodel.Scene, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinarySceneLoader struct {
	fetch func(keys []id.SceneID) ([]*gqlmodel.Scene, []error)
}

func (l *ordinarySceneLoader) Load(key id.SceneID) (*gqlmodel.Scene, error) {
	res, errs := l.fetch([]id.SceneID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinarySceneLoader) LoadAll(keys []id.SceneID) ([]*gqlmodel.Scene, []error) {
	return l.fetch(keys)
}
