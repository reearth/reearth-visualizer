package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Dataset() DatasetResolver {
	return &datasetResolver{r}
}

func (r *Resolver) DatasetField() DatasetFieldResolver {
	return &datasetFieldResolver{r}
}

type datasetResolver struct{ *Resolver }

func (r *datasetResolver) Schema(ctx context.Context, obj *graphql1.Dataset) (*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
}

func (r *datasetResolver) Name(ctx context.Context, obj *graphql1.Dataset) (*string, error) {
	exit := trace(ctx)
	defer exit()

	ds, err := dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
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

func (r *datasetFieldResolver) Field(ctx context.Context, obj *graphql1.DatasetField) (*graphql1.DatasetSchemaField, error) {
	exit := trace(ctx)
	defer exit()

	ds, err := dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
	return ds.Field(obj.FieldID), err
}

func (r *datasetFieldResolver) Schema(ctx context.Context, obj *graphql1.DatasetField) (*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
}

func (r *datasetFieldResolver) ValueRef(ctx context.Context, obj *graphql1.DatasetField) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.Value == nil {
		return nil, nil
	}
	idstr, ok := (obj.Value).(id.ID)
	if !ok {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(idstr))
}
