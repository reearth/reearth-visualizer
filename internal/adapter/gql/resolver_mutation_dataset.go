package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *mutationResolver) UpdateDatasetSchema(ctx context.Context, input gqlmodel.UpdateDatasetSchemaInput) (*gqlmodel.UpdateDatasetSchemaPayload, error) {
	res, err := usecases(ctx).Dataset.UpdateDatasetSchema(ctx, interfaces.UpdateDatasetSchemaParam{
		SchemaId: id.DatasetSchemaID(input.SchemaID),
		Name:     input.Name,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateDatasetSchemaPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) AddDynamicDatasetSchema(ctx context.Context, input gqlmodel.AddDynamicDatasetSchemaInput) (*gqlmodel.AddDynamicDatasetSchemaPayload, error) {
	res, err := usecases(ctx).Dataset.AddDynamicDatasetSchema(ctx, interfaces.AddDynamicDatasetSchemaParam{
		SceneId: id.SceneID(input.SceneID),
	})
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddDynamicDatasetSchemaPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) AddDynamicDataset(ctx context.Context, input gqlmodel.AddDynamicDatasetInput) (*gqlmodel.AddDynamicDatasetPayload, error) {
	dss, ds, err := usecases(ctx).Dataset.AddDynamicDataset(ctx, interfaces.AddDynamicDatasetParam{
		SchemaId: id.DatasetSchemaID(input.DatasetSchemaID),
		Author:   input.Author,
		Content:  input.Content,
		Lat:      input.Lat,
		Lng:      input.Lng,
		Target:   input.Target,
	})
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddDynamicDatasetPayload{DatasetSchema: gqlmodel.ToDatasetSchema(dss), Dataset: gqlmodel.ToDataset(ds)}, nil
}

func (r *mutationResolver) SyncDataset(ctx context.Context, input gqlmodel.SyncDatasetInput) (*gqlmodel.SyncDatasetPayload, error) {
	dss, ds, err := usecases(ctx).Dataset.Sync(ctx, id.SceneID(input.SceneID), input.URL, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	schemas := make([]*gqlmodel.DatasetSchema, 0, len(dss))
	datasets := make([]*gqlmodel.Dataset, 0, len(ds))
	for _, d := range dss {
		schemas = append(schemas, gqlmodel.ToDatasetSchema(d))
	}
	for _, d := range ds {
		datasets = append(datasets, gqlmodel.ToDataset(d))
	}

	return &gqlmodel.SyncDatasetPayload{
		SceneID:       input.SceneID,
		URL:           input.URL,
		DatasetSchema: schemas,
		Dataset:       datasets,
	}, nil
}

func (r *mutationResolver) RemoveDatasetSchema(ctx context.Context, input gqlmodel.RemoveDatasetSchemaInput) (*gqlmodel.RemoveDatasetSchemaPayload, error) {
	res, err := usecases(ctx).Dataset.RemoveDatasetSchema(ctx, interfaces.RemoveDatasetSchemaParam{
		SchemaID: id.DatasetSchemaID(input.SchemaID),
		Force:    input.Force,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveDatasetSchemaPayload{SchemaID: res.ID()}, nil
}

func (r *mutationResolver) AddDatasetSchema(ctx context.Context, input gqlmodel.AddDatasetSchemaInput) (*gqlmodel.AddDatasetSchemaPayload, error) {
	res, err2 := usecases(ctx).Dataset.AddDatasetSchema(ctx, interfaces.AddDatasetSchemaParam{
		SceneId:             id.SceneID(input.SceneID),
		Name:                input.Name,
		RepresentativeField: id.DatasetSchemaFieldIDFromRefID(input.Representativefield),
	}, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.AddDatasetSchemaPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) ImportDataset(ctx context.Context, input gqlmodel.ImportDatasetInput) (*gqlmodel.ImportDatasetPayload, error) {
	res, err := usecases(ctx).Dataset.ImportDataset(ctx, interfaces.ImportDatasetParam{
		SceneId:  id.SceneID(input.SceneID),
		SchemaId: id.DatasetSchemaIDFromRefID(input.DatasetSchemaID),
		File:     gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ImportDatasetPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) ImportDatasetFromGoogleSheet(ctx context.Context, input gqlmodel.ImportDatasetFromGoogleSheetInput) (*gqlmodel.ImportDatasetPayload, error) {
	res, err := usecases(ctx).Dataset.ImportDatasetFromGoogleSheet(ctx, interfaces.ImportDatasetFromGoogleSheetParam{
		Token:     input.AccessToken,
		FileID:    input.FileID,
		SheetName: input.SheetName,
		SceneId:   id.SceneID(input.SceneID),
		SchemaId:  id.DatasetSchemaIDFromRefID(input.DatasetSchemaID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ImportDatasetPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}
