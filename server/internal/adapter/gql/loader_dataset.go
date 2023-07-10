package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type DatasetLoader struct {
	usecase interfaces.Dataset
}

func NewDatasetLoader(usecase interfaces.Dataset) *DatasetLoader {
	return &DatasetLoader{usecase: usecase}
}

func (c *DatasetLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Dataset, []error) {
	datasetids, err := util.TryMap(ids, gqlmodel.ToID[id.Dataset])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, datasetids)
	if err != nil {
		return nil, []error{err}
	}

	datasets := make([]*gqlmodel.Dataset, 0, len(res))
	for _, d := range res {
		datasets = append(datasets, gqlmodel.ToDataset(d))
	}

	return datasets, nil
}

func (c *DatasetLoader) FetchSchema(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.DatasetSchema, []error) {
	schemaids, err := util.TryMap(ids, gqlmodel.ToID[id.DatasetSchema])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FetchSchema(ctx, schemaids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	schemas := make([]*gqlmodel.DatasetSchema, 0, len(res))
	for _, d := range res {
		schemas = append(schemas, gqlmodel.ToDatasetSchema(d))
	}

	return schemas, nil
}

func (c *DatasetLoader) GraphFetch(ctx context.Context, i gqlmodel.ID, depth int) ([]*gqlmodel.Dataset, []error) {
	did, err := gqlmodel.ToID[id.Dataset](i)
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.GraphFetch(ctx, did, depth, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	datasets := make([]*gqlmodel.Dataset, 0, len(res))
	for _, d := range res {
		datasets = append(datasets, gqlmodel.ToDataset(d))
	}

	return datasets, nil
}

func (c *DatasetLoader) GraphFetchSchema(ctx context.Context, i gqlmodel.ID, depth int) ([]*gqlmodel.DatasetSchema, []error) {
	did, err := gqlmodel.ToID[id.DatasetSchema](i)
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.GraphFetchSchema(ctx, did, depth, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	schemas := make([]*gqlmodel.DatasetSchema, 0, len(res))
	for _, d := range res {
		schemas = append(schemas, gqlmodel.ToDatasetSchema(d))
	}

	return schemas, nil
}

func (c *DatasetLoader) FindSchemaByScene(ctx context.Context, i gqlmodel.ID, first *int, last *int, before *usecasex.Cursor, after *usecasex.Cursor) (*gqlmodel.DatasetSchemaConnection, error) {
	sid, err := gqlmodel.ToID[id.Scene](i)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindSchemaByScene(ctx, sid, usecasex.CursorPagination{
		First:  intToInt64(first),
		Last:   intToInt64(last),
		Before: before,
		After:  after,
	}.Wrap(), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.DatasetSchemaEdge, 0, len(res))
	nodes := make([]*gqlmodel.DatasetSchema, 0, len(res))
	for _, dataset := range res {
		ds := gqlmodel.ToDatasetSchema(dataset)
		edges = append(edges, &gqlmodel.DatasetSchemaEdge{
			Node:   ds,
			Cursor: usecasex.Cursor(ds.ID),
		})
		nodes = append(nodes, ds)
	}

	return &gqlmodel.DatasetSchemaConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *DatasetLoader) FindBySchema(ctx context.Context, dsid gqlmodel.ID, first *int, last *int, before *usecasex.Cursor, after *usecasex.Cursor) (*gqlmodel.DatasetConnection, error) {
	schemaid, err := gqlmodel.ToID[id.DatasetSchema](dsid)
	if err != nil {
		return nil, err
	}

	p := usecasex.CursorPagination{
		First:  intToInt64(first),
		Last:   intToInt64(last),
		Before: before,
		After:  after,
	}.Wrap()
	res, pi, err2 := c.usecase.FindBySchema(ctx, schemaid, p, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	edges := make([]*gqlmodel.DatasetEdge, 0, len(res))
	nodes := make([]*gqlmodel.Dataset, 0, len(res))
	for _, dataset := range res {
		ds := gqlmodel.ToDataset(dataset)
		edges = append(edges, &gqlmodel.DatasetEdge{
			Node:   ds,
			Cursor: usecasex.Cursor(ds.ID),
		})
		nodes = append(nodes, ds)
	}

	conn := &gqlmodel.DatasetConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}

	return conn, nil
}

func (c *DatasetLoader) CountBySchema(ctx context.Context, dsid gqlmodel.ID) (int, error) {
	id, err := gqlmodel.ToID[id.DatasetSchema](dsid)
	if err != nil {
		return 0, err
	}

	cnt, err := c.usecase.CountBySchema(ctx, id)
	if err != nil {
		return 0, err
	}

	return cnt, nil
}

// data loader

type DatasetDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Dataset, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Dataset, []error)
}

func (c *DatasetLoader) DataLoader(ctx context.Context) DatasetDataLoader {
	return gqldataloader.NewDatasetLoader(gqldataloader.DatasetLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Dataset, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *DatasetLoader) OrdinaryDataLoader(ctx context.Context) DatasetDataLoader {
	return &ordinaryDatasetLoader{ctx: ctx, c: c}
}

type ordinaryDatasetLoader struct {
	ctx context.Context
	c   *DatasetLoader
}

func (l *ordinaryDatasetLoader) Load(key gqlmodel.ID) (*gqlmodel.Dataset, error) {
	res, errs := l.c.Fetch(l.ctx, []gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryDatasetLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Dataset, []error) {
	return l.c.Fetch(l.ctx, keys)
}

type DatasetSchemaDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.DatasetSchema, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.DatasetSchema, []error)
}

func (c *DatasetLoader) SchemaDataLoader(ctx context.Context) DatasetSchemaDataLoader {
	return gqldataloader.NewDatasetSchemaLoader(gqldataloader.DatasetSchemaLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.DatasetSchema, []error) {
			return c.FetchSchema(ctx, keys)
		},
	})
}

func (c *DatasetLoader) SchemaOrdinaryDataLoader(ctx context.Context) DatasetSchemaDataLoader {
	return &ordinaryDatasetSchemaLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.DatasetSchema, []error) {
			return c.FetchSchema(ctx, keys)
		},
	}
}

type ordinaryDatasetSchemaLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.DatasetSchema, []error)
}

func (l *ordinaryDatasetSchemaLoader) Load(key gqlmodel.ID) (*gqlmodel.DatasetSchema, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryDatasetSchemaLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.DatasetSchema, []error) {
	return l.fetch(keys)
}
