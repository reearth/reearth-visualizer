package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

type LayerLoader struct {
	usecase interfaces.Layer
}

func NewLayerLoader(usecase interfaces.Layer) *LayerLoader {
	return &LayerLoader{usecase: usecase}
}

func (c *LayerLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Layer, []error) {
	layerids, err := util.TryMap(ids, gqlmodel.ToID[id.Layer])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, layerids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	layers := make([]*gqlmodel.Layer, 0, len(res))
	for _, l := range res {
		if l == nil {
			layers = append(layers, nil)
		} else {
			layer := gqlmodel.ToLayer(*l, nil)
			layers = append(layers, &layer)
		}
	}

	return layers, nil
}

func (c *LayerLoader) FetchGroup(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.LayerGroup, []error) {
	layerids, err := util.TryMap(ids, gqlmodel.ToID[id.Layer])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FetchGroup(ctx, layerids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	layerGroups := make([]*gqlmodel.LayerGroup, 0, len(res))
	for _, l := range res {
		layerGroups = append(layerGroups, gqlmodel.ToLayerGroup(l, nil))
	}

	return layerGroups, nil
}

func (c *LayerLoader) FetchItem(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.LayerItem, []error) {
	layerids, err := util.TryMap(ids, gqlmodel.ToID[id.Layer])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FetchItem(ctx, layerids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	layerItems := make([]*gqlmodel.LayerItem, 0, len(res))
	for _, l := range res {
		layerItems = append(layerItems, gqlmodel.ToLayerItem(l, nil))
	}

	return layerItems, nil
}

func (c *LayerLoader) FetchParent(ctx context.Context, lid gqlmodel.ID) (*gqlmodel.LayerGroup, error) {
	layerid, err := gqlmodel.ToID[id.Layer](lid)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FetchParent(ctx, layerid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToLayerGroup(res, nil), nil
}

func (c *LayerLoader) FetchByProperty(ctx context.Context, pid gqlmodel.ID) (gqlmodel.Layer, error) {
	propertyid, err := gqlmodel.ToID[id.Property](pid)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FetchByProperty(ctx, propertyid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToLayer(res, nil), nil
}

func (c *LayerLoader) FetchMerged(ctx context.Context, org gqlmodel.ID, parent *gqlmodel.ID) (*gqlmodel.MergedLayer, error) {
	orgid, err := gqlmodel.ToID[id.Layer](org)
	if err != nil {
		return nil, err
	}

	res, err2 := c.usecase.FetchMerged(ctx, orgid, gqlmodel.ToIDRef[id.Layer](parent), getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return gqlmodel.ToMergedLayer(res), nil
}

func (c *LayerLoader) FetchParentAndMerged(ctx context.Context, org gqlmodel.ID) (*gqlmodel.MergedLayer, error) {
	orgid, err := gqlmodel.ToID[id.Layer](org)
	if err != nil {
		return nil, err
	}

	res, err2 := c.usecase.FetchParentAndMerged(ctx, orgid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return gqlmodel.ToMergedLayer(res), nil
}

func (c *LayerLoader) FetchByTag(ctx context.Context, tag gqlmodel.ID) ([]gqlmodel.Layer, error) {
	tagid, err := gqlmodel.ToID[id.Tag](tag)
	if err != nil {
		return nil, err
	}

	res, err2 := c.usecase.FetchByTag(ctx, tagid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	layers := make([]gqlmodel.Layer, 0, len(res))
	for _, l := range res {
		if l == nil {
			layers = append(layers, nil)
		} else {
			layers = append(layers, gqlmodel.ToLayer(*l, nil))
		}
	}

	return layers, nil
}

// data loader

type LayerDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Layer, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Layer, []error)
}

func (c *LayerLoader) DataLoader(ctx context.Context) LayerDataLoader {
	return gqldataloader.NewLayerLoader(gqldataloader.LayerLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Layer, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *LayerLoader) OrdinaryDataLoader(ctx context.Context) LayerDataLoader {
	return &ordinaryLayerLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Layer, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryLayerLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Layer, []error)
}

func (l *ordinaryLayerLoader) Load(key gqlmodel.ID) (*gqlmodel.Layer, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryLayerLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Layer, []error) {
	return l.fetch(keys)
}

type LayerItemDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.LayerItem, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.LayerItem, []error)
}

func (c *LayerLoader) ItemDataLoader(ctx context.Context) LayerItemDataLoader {
	return gqldataloader.NewLayerItemLoader(gqldataloader.LayerItemLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.LayerItem, []error) {
			return c.FetchItem(ctx, keys)
		},
	})
}

func (c *LayerLoader) ItemOrdinaryDataLoader(ctx context.Context) LayerItemDataLoader {
	return &ordinaryLayerItemLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.LayerItem, []error) {
			return c.FetchItem(ctx, keys)
		},
	}
}

type ordinaryLayerItemLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.LayerItem, []error)
}

func (l *ordinaryLayerItemLoader) Load(key gqlmodel.ID) (*gqlmodel.LayerItem, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryLayerItemLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.LayerItem, []error) {
	return l.fetch(keys)
}

type LayerGroupDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.LayerGroup, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.LayerGroup, []error)
}

func (c *LayerLoader) GroupDataLoader(ctx context.Context) LayerGroupDataLoader {
	return gqldataloader.NewLayerGroupLoader(gqldataloader.LayerGroupLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.LayerGroup, []error) {
			return c.FetchGroup(ctx, keys)
		},
	})
}

func (c *LayerLoader) GroupOrdinaryDataLoader(ctx context.Context) LayerGroupDataLoader {
	return &ordinaryLayerGroupLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.LayerGroup, []error) {
			return c.FetchGroup(ctx, keys)
		},
	}
}

type ordinaryLayerGroupLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.LayerGroup, []error)
}

func (l *ordinaryLayerGroupLoader) Load(key gqlmodel.ID) (*gqlmodel.LayerGroup, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryLayerGroupLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.LayerGroup, []error) {
	return l.fetch(keys)
}
