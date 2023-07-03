package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

func (r *mutationResolver) UpdateDatasetSchema(ctx context.Context, input gqlmodel.UpdateDatasetSchemaInput) (*gqlmodel.UpdateDatasetSchemaPayload, error) {
	dsid, err := gqlmodel.ToID[id.DatasetSchema](input.SchemaID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Dataset.UpdateDatasetSchema(ctx, interfaces.UpdateDatasetSchemaParam{
		SchemaId: dsid,
		Name:     input.Name,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateDatasetSchemaPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) SyncDataset(ctx context.Context, input gqlmodel.SyncDatasetInput) (*gqlmodel.SyncDatasetPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	dss, ds, err := usecases(ctx).Dataset.Sync(ctx, sid, input.URL, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.SyncDatasetPayload{
		SceneID:       input.SceneID,
		URL:           input.URL,
		DatasetSchema: util.Map(dss, gqlmodel.ToDatasetSchema),
		Dataset:       util.Map(ds, gqlmodel.ToDataset),
	}, nil
}

func (r *mutationResolver) RemoveDatasetSchema(ctx context.Context, input gqlmodel.RemoveDatasetSchemaInput) (*gqlmodel.RemoveDatasetSchemaPayload, error) {
	sid, err := gqlmodel.ToID[id.DatasetSchema](input.SchemaID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Dataset.RemoveDatasetSchema(ctx, interfaces.RemoveDatasetSchemaParam{
		SchemaID: sid,
		Force:    input.Force,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.RemoveDatasetSchemaPayload{SchemaID: gqlmodel.IDFrom(res)}, nil
}

func (r *mutationResolver) AddDatasetSchema(ctx context.Context, input gqlmodel.AddDatasetSchemaInput) (*gqlmodel.AddDatasetSchemaPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Dataset.AddDatasetSchema(ctx, interfaces.AddDatasetSchemaParam{
		SceneId:             sid,
		Name:                input.Name,
		RepresentativeField: gqlmodel.ToIDRef[id.DatasetField](input.Representativefield),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddDatasetSchemaPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) ImportDataset(ctx context.Context, input gqlmodel.ImportDatasetInput) (*gqlmodel.ImportDatasetPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Dataset.ImportDataset(ctx, interfaces.ImportDatasetParam{
		SceneId:  sid,
		SchemaId: gqlmodel.ToIDRef[id.DatasetSchema](input.DatasetSchemaID),
		File:     gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ImportDatasetPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}

func (r *mutationResolver) ImportDatasetFromGoogleSheet(ctx context.Context, input gqlmodel.ImportDatasetFromGoogleSheetInput) (*gqlmodel.ImportDatasetPayload, error) {
	sid, err := gqlmodel.ToID[id.Scene](input.SceneID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Dataset.ImportDatasetFromGoogleSheet(ctx, interfaces.ImportDatasetFromGoogleSheetParam{
		Token:     input.AccessToken,
		FileID:    input.FileID,
		SheetName: input.SheetName,
		SceneId:   sid,
		SchemaId:  gqlmodel.ToIDRef[id.DatasetSchema](input.DatasetSchemaID),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ImportDatasetPayload{DatasetSchema: gqlmodel.ToDatasetSchema(res)}, nil
}
