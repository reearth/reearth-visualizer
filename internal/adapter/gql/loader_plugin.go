package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/util"
)

type PluginLoader struct {
	usecase interfaces.Plugin
}

func NewPluginLoader(usecase interfaces.Plugin) *PluginLoader {
	return &PluginLoader{usecase: usecase}
}

func (c *PluginLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Plugin, []error) {
	ids2, err := util.TryMap(ids, gqlmodel.ToPluginID)
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, ids2, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	plugins := make([]*gqlmodel.Plugin, 0, len(res))
	for _, pl := range res {
		plugins = append(plugins, gqlmodel.ToPlugin(pl))
	}

	return plugins, nil
}

// data loader

type PluginDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Plugin, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Plugin, []error)
}

func (c *PluginLoader) DataLoader(ctx context.Context) PluginDataLoader {
	return gqldataloader.NewPluginLoader(gqldataloader.PluginLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Plugin, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *PluginLoader) OrdinaryDataLoader(ctx context.Context) PluginDataLoader {
	return &ordinaryPluginLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Plugin, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryPluginLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Plugin, []error)
}

func (l *ordinaryPluginLoader) Load(key gqlmodel.ID) (*gqlmodel.Plugin, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryPluginLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Plugin, []error) {
	return l.fetch(keys)
}
