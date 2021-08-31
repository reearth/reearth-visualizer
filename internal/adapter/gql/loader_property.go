package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

type PropertyLoader struct {
	usecase interfaces.Property
}

func NewPropertyLoader(usecase interfaces.Property) *PropertyLoader {
	return &PropertyLoader{usecase: usecase}
}

func (c *PropertyLoader) Fetch(ctx context.Context, ids []id.PropertyID) ([]*gqlmodel.Property, []error) {
	res, err := c.usecase.Fetch(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	properties := make([]*gqlmodel.Property, 0, len(res))
	for _, property := range res {
		properties = append(properties, gqlmodel.ToProperty(property))
	}

	return properties, nil
}

func (c *PropertyLoader) FetchSchema(ctx context.Context, ids []id.PropertySchemaID) ([]*gqlmodel.PropertySchema, []error) {
	res, err := c.usecase.FetchSchema(ctx, ids, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	schemas := make([]*gqlmodel.PropertySchema, 0, len(res))
	for _, propertySchema := range res {
		schemas = append(schemas, gqlmodel.ToPropertySchema(propertySchema))
	}

	return schemas, nil
}

func (c *PropertyLoader) FetchMerged(ctx context.Context, org, parent, linked *id.ID) (*gqlmodel.MergedProperty, error) {
	res, err := c.usecase.FetchMerged(ctx, id.PropertyIDFromRefID(org), id.PropertyIDFromRefID(parent), id.DatasetIDFromRefID(linked), getOperator(ctx))

	if err != nil {
		return nil, err
	}

	return gqlmodel.ToMergedProperty(res), nil
}

// data loader

type PropertyDataLoader interface {
	Load(id.PropertyID) (*gqlmodel.Property, error)
	LoadAll([]id.PropertyID) ([]*gqlmodel.Property, []error)
}

func (c *PropertyLoader) DataLoader(ctx context.Context) PropertyDataLoader {
	return gqldataloader.NewPropertyLoader(gqldataloader.PropertyLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []id.PropertyID) ([]*gqlmodel.Property, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *PropertyLoader) OrdinaryDataLoader(ctx context.Context) PropertyDataLoader {
	return &ordinaryPropertyLoader{
		fetch: func(keys []id.PropertyID) ([]*gqlmodel.Property, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryPropertyLoader struct {
	fetch func(keys []id.PropertyID) ([]*gqlmodel.Property, []error)
}

func (l *ordinaryPropertyLoader) Load(key id.PropertyID) (*gqlmodel.Property, error) {
	res, errs := l.fetch([]id.PropertyID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryPropertyLoader) LoadAll(keys []id.PropertyID) ([]*gqlmodel.Property, []error) {
	return l.fetch(keys)
}

type PropertySchemaDataLoader interface {
	Load(id.PropertySchemaID) (*gqlmodel.PropertySchema, error)
	LoadAll([]id.PropertySchemaID) ([]*gqlmodel.PropertySchema, []error)
}

func (c *PropertyLoader) SchemaDataLoader(ctx context.Context) PropertySchemaDataLoader {
	return gqldataloader.NewPropertySchemaLoader(gqldataloader.PropertySchemaLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []id.PropertySchemaID) ([]*gqlmodel.PropertySchema, []error) {
			return c.FetchSchema(ctx, keys)
		},
	})
}

func (c *PropertyLoader) SchemaOrdinaryDataLoader(ctx context.Context) PropertySchemaDataLoader {
	return &ordinaryPropertySchemaLoader{
		fetch: func(keys []id.PropertySchemaID) ([]*gqlmodel.PropertySchema, []error) {
			return c.FetchSchema(ctx, keys)
		},
	}
}

type ordinaryPropertySchemaLoader struct {
	fetch func(keys []id.PropertySchemaID) ([]*gqlmodel.PropertySchema, []error)
}

func (l *ordinaryPropertySchemaLoader) Load(key id.PropertySchemaID) (*gqlmodel.PropertySchema, error) {
	res, errs := l.fetch([]id.PropertySchemaID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryPropertySchemaLoader) LoadAll(keys []id.PropertySchemaID) ([]*gqlmodel.PropertySchema, []error) {
	return l.fetch(keys)
}
