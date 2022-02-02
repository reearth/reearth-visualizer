package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Dataset() DatasetResolver {
	return &datasetResolver{r}
}

func (r *Resolver) DatasetField() DatasetFieldResolver {
	return &datasetFieldResolver{r}
}

type datasetResolver struct{ *Resolver }

func (r *datasetResolver) Schema(ctx context.Context, obj *gqlmodel.Dataset) (*gqlmodel.DatasetSchema, error) {
	return dataloaders(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
}

func (r *datasetResolver) Name(ctx context.Context, obj *gqlmodel.Dataset) (*string, error) {
	ds, err := dataloaders(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
	if err != nil || ds == nil || ds.RepresentativeFieldID == nil {
		return nil, err
	}
	f := obj.Field(*ds.RepresentativeFieldID)
	if f == nil {
		return nil, nil
	}
	if v, ok := f.Value.(string); ok {
		v2 := &v
		return v2, nil
	}
	return nil, nil
}

type datasetFieldResolver struct{ *Resolver }

func (r *datasetFieldResolver) Field(ctx context.Context, obj *gqlmodel.DatasetField) (*gqlmodel.DatasetSchemaField, error) {
	ds, err := dataloaders(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
	return ds.Field(obj.FieldID), err
}

func (r *datasetFieldResolver) Schema(ctx context.Context, obj *gqlmodel.DatasetField) (*gqlmodel.DatasetSchema, error) {
	return dataloaders(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
}

func (r *datasetFieldResolver) ValueRef(ctx context.Context, obj *gqlmodel.DatasetField) (*gqlmodel.Dataset, error) {
	if obj.Value == nil {
		return nil, nil
	}
	idstr, ok := (obj.Value).(id.ID)
	if !ok {
		return nil, nil
	}
	return dataloaders(ctx).Dataset.Load(id.DatasetID(idstr))
}
