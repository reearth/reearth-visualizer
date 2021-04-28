package graphql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (c *DatasetController) Fetch(ctx context.Context, ids []id.DatasetID, operator *usecase.Operator) ([]*Dataset, []error) {
	res, err := c.usecase().Fetch(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	datasets := make([]*Dataset, 0, len(res))
	for _, d := range res {
		datasets = append(datasets, toDataset(d))
	}

	return datasets, nil
}

func (c *DatasetController) FetchSchema(ctx context.Context, ids []id.DatasetSchemaID, operator *usecase.Operator) ([]*DatasetSchema, []error) {
	res, err := c.usecase().FetchSchema(ctx, ids, operator)
	if err != nil {
		return nil, []error{err}
	}

	schemas := make([]*DatasetSchema, 0, len(res))
	for _, d := range res {
		schemas = append(schemas, toDatasetSchema(d))
	}

	return schemas, nil
}

func (c *DatasetController) GraphFetch(ctx context.Context, i id.DatasetID, depth int, operator *usecase.Operator) ([]*Dataset, []error) {
	res, err := c.usecase().GraphFetch(ctx, i, depth, operator)
	if err != nil {
		return nil, []error{err}
	}

	datasets := make([]*Dataset, 0, len(res))
	for _, d := range res {
		datasets = append(datasets, toDataset(d))
	}

	return datasets, nil
}
