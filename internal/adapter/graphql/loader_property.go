package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (c *PropertyController) Fetch(ctx context.Context, ids []id.PropertyID, operator *usecase.Operator) ([]*Property, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	properties := make([]*Property, 0, len(res))
	for _, property := range res {
		properties = append(properties, toProperty(property))
	}

	return properties, nil
}

func (c *PropertyController) FetchSchema(ctx context.Context, ids []id.PropertySchemaID, operator *usecase.Operator) ([]*PropertySchema, []error) {
	res, err := c.usecase().FetchSchema(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	schemas := make([]*PropertySchema, 0, len(res))
	for _, propertySchema := range res {
		schemas = append(schemas, toPropertySchema(propertySchema))
	}

	return schemas, nil
}

func (c *PropertyController) FetchMerged(ctx context.Context, org, parent, linked *id.ID, operator *usecase.Operator) (*MergedProperty, error) {
	res, err := c.usecase().FetchMerged(ctx, id.PropertyIDFromRefID(org), id.PropertyIDFromRefID(parent), id.DatasetIDFromRefID(linked), operator)

	if err != nil {
		return nil, err
	}

	return toMergedProperty(res), nil
}
