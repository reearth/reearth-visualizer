package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
)

type tagItemResolver struct{ *Resolver }

func (r *Resolver) TagItem() TagItemResolver {
	return &tagItemResolver{r}
}

func (t tagItemResolver) LinkedDatasetSchema(ctx context.Context, obj *gqlmodel.TagItem) (*gqlmodel.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(*obj.LinkedDatasetSchemaID))
}

func (t tagItemResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.TagItem) (*gqlmodel.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (t tagItemResolver) LinkedDatasetField(ctx context.Context, obj *gqlmodel.TagItem) (*gqlmodel.DatasetField, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	ds, err := DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
	return ds.Field(*obj.LinkedDatasetFieldID), err
}
