package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) DatasetSchema() DatasetSchemaResolver {
	return &datasetSchemaResolver{r}
}

func (r *Resolver) DatasetSchemaField() DatasetSchemaFieldResolver {
	return &datasetSchemaFieldResolver{r}
}

type datasetSchemaResolver struct{ *Resolver }

func (r *datasetSchemaResolver) Scene(ctx context.Context, obj *graphql1.DatasetSchema) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *datasetSchemaResolver) RepresentativeField(ctx context.Context, obj *graphql1.DatasetSchema) (*graphql1.DatasetSchemaField, error) {
	exit := trace(ctx)
	defer exit()

	if obj.RepresentativeFieldID == nil {
		return nil, nil
	}
	nf := *obj.RepresentativeFieldID
	for _, f := range obj.Fields {
		if f.ID == nf {
			return f, nil
		}
	}
	return nil, nil
}

func (r *datasetSchemaResolver) Datasets(ctx context.Context, obj *graphql1.DatasetSchema, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.DatasetConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.FindBySchema(ctx, obj.ID, first, last, before, after, getOperator(ctx))
}

type datasetSchemaFieldResolver struct{ *Resolver }

func (r *datasetSchemaFieldResolver) Schema(ctx context.Context, obj *graphql1.DatasetSchemaField) (*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(obj.SchemaID))
}

func (r *datasetSchemaFieldResolver) Ref(ctx context.Context, obj *graphql1.DatasetSchemaField) (*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.RefID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(*obj.RefID))
}
