package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

type PropertyLoader struct {
	usecase interfaces.Property
}

func NewPropertyLoader(usecase interfaces.Property) *PropertyLoader {
	return &PropertyLoader{usecase: usecase}
}

func (c *PropertyLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Property, []error) {
	ids2, err := util.TryMap(ids, gqlmodel.ToID[id.Property])
	if err != nil {
		return nil, []error{err}
	}

	op := getOperator(ctx)

	res, err := c.usecase.Fetch(ctx, ids2, op)
	if err != nil {
		return nil, []error{err}
	}

	properties := make([]*gqlmodel.Property, 0, len(res))
	for _, property := range res {
		properties = append(properties, gqlmodel.ToProperty(property))
	}

	return properties, nil
}

// data loader

type PropertyDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Property, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Property, []error)
}

func (c *PropertyLoader) DataLoader(ctx context.Context) PropertyDataLoader {
	return gqldataloader.NewPropertyLoader(gqldataloader.PropertyLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Property, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *PropertyLoader) OrdinaryDataLoader(ctx context.Context) PropertyDataLoader {
	return &ordinaryPropertyLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Property, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryPropertyLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Property, []error)
}

func (l *ordinaryPropertyLoader) Load(key gqlmodel.ID) (*gqlmodel.Property, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryPropertyLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Property, []error) {
	return l.fetch(keys)
}

type PropertySchemaDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.PropertySchema, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.PropertySchema, []error)
}
