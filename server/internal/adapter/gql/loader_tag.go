package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

type TagLoader struct {
	usecase interfaces.Tag
}

func NewTagLoader(usecase interfaces.Tag) *TagLoader {
	return &TagLoader{usecase: usecase}
}

func (c *TagLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Tag, []error) {
	tagids, err := util.TryMap(ids, gqlmodel.ToID[id.Tag])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, tagids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	tags := make([]*gqlmodel.Tag, 0, len(res))
	for _, t := range res {
		if t != nil {
			tag := gqlmodel.ToTag(*t)
			tags = append(tags, &tag)
		}
	}

	return tags, nil
}

func (c *TagLoader) FetchGroup(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.TagGroup, []error) {
	tids, err := util.TryMap(ids, gqlmodel.ToID[id.Tag])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FetchGroup(ctx, tids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	tagGroups := make([]*gqlmodel.TagGroup, 0, len(res))
	for _, t := range res {
		tg := gqlmodel.ToTagGroup(t)
		if tg != nil {
			tagGroups = append(tagGroups, tg)
		}
	}

	return tagGroups, nil
}

func (c *TagLoader) FetchItem(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.TagItem, []error) {
	tids, err := util.TryMap(ids, gqlmodel.ToID[id.Tag])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FetchItem(ctx, tids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	tagItems := make([]*gqlmodel.TagItem, 0, len(res))
	for _, t := range res {
		ti := gqlmodel.ToTagItem(t)
		if ti != nil {
			tagItems = append(tagItems, ti)
		}
	}

	return tagItems, nil
}

// data loaders

type TagDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Tag, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Tag, []error)
}

func (c *TagLoader) DataLoader(ctx context.Context) TagDataLoader {
	return gqldataloader.NewTagLoader(gqldataloader.TagLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Tag, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *TagLoader) OrdinaryDataLoader(ctx context.Context) TagDataLoader {
	return &ordinaryTagLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Tag, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryTagLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Tag, []error)
}

func (t *ordinaryTagLoader) Load(key gqlmodel.ID) (*gqlmodel.Tag, error) {
	res, errs := t.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (t *ordinaryTagLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Tag, []error) {
	return t.fetch(keys)
}

type TagItemDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.TagItem, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.TagItem, []error)
}

func (c *TagLoader) ItemDataLoader(ctx context.Context) TagItemDataLoader {
	return gqldataloader.NewTagItemLoader(gqldataloader.TagItemLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.TagItem, []error) {
			return c.FetchItem(ctx, keys)
		},
	})
}

func (c *TagLoader) ItemOrdinaryDataLoader(ctx context.Context) TagItemDataLoader {
	return &ordinaryTagItemLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.TagItem, []error) {
			return c.FetchItem(ctx, keys)
		},
	}
}

type ordinaryTagItemLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.TagItem, []error)
}

func (t *ordinaryTagItemLoader) Load(key gqlmodel.ID) (*gqlmodel.TagItem, error) {
	res, errs := t.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (t *ordinaryTagItemLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.TagItem, []error) {
	return t.fetch(keys)
}

type TagGroupDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.TagGroup, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.TagGroup, []error)
}

func (c *TagLoader) GroupDataLoader(ctx context.Context) TagGroupDataLoader {
	return gqldataloader.NewTagGroupLoader(gqldataloader.TagGroupLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.TagGroup, []error) {
			return c.FetchGroup(ctx, keys)
		},
	})
}

func (c *TagLoader) GroupOrdinaryDataLoader(ctx context.Context) TagGroupDataLoader {
	return &ordinaryTagGroupLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.TagGroup, []error) {
			return c.FetchGroup(ctx, keys)
		},
	}
}

type ordinaryTagGroupLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.TagGroup, []error)
}

func (t *ordinaryTagGroupLoader) Load(key gqlmodel.ID) (*gqlmodel.TagGroup, error) {
	res, errs := t.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (t *ordinaryTagGroupLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.TagGroup, []error) {
	return t.fetch(keys)
}
