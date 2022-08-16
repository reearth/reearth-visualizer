package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

type SceneLoader struct {
	usecase interfaces.Scene
}

func NewSceneLoader(usecase interfaces.Scene) *SceneLoader {
	return &SceneLoader{usecase: usecase}
}

func (c *SceneLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Scene, []error) {
	pids, err := util.TryMap(ids, gqlmodel.ToID[id.Scene])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, pids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	scenes := make([]*gqlmodel.Scene, 0, len(res))
	for _, scene := range res {
		scenes = append(scenes, gqlmodel.ToScene(scene))
	}
	return scenes, nil
}

func (c *SceneLoader) FindByProject(ctx context.Context, projectID gqlmodel.ID) (*gqlmodel.Scene, error) {
	pid, err := gqlmodel.ToID[id.Project](projectID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindByProject(ctx, pid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToScene(res), nil
}

// data loader

type SceneDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Scene, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Scene, []error)
}

func (c *SceneLoader) DataLoader(ctx context.Context) SceneDataLoader {
	return gqldataloader.NewSceneLoader(gqldataloader.SceneLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Scene, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *SceneLoader) OrdinaryDataLoader(ctx context.Context) SceneDataLoader {
	return &ordinarySceneLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Scene, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinarySceneLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Scene, []error)
}

func (l *ordinarySceneLoader) Load(key gqlmodel.ID) (*gqlmodel.Scene, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinarySceneLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Scene, []error) {
	return l.fetch(keys)
}
