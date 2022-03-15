package repo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
)

type DatasetSchema interface {
	Filtered(SceneFilter) DatasetSchema
	FindByID(context.Context, id.DatasetSchemaID) (*dataset.Schema, error)
	FindByIDs(context.Context, []id.DatasetSchemaID) (dataset.SchemaList, error)
	FindByScene(context.Context, id.SceneID, *usecase.Pagination) (dataset.SchemaList, *usecase.PageInfo, error)
	FindBySceneAll(context.Context, id.SceneID) (dataset.SchemaList, error)
	FindBySceneAndSource(context.Context, id.SceneID, string) (dataset.SchemaList, error)
	FindDynamicByID(context.Context, id.DatasetSchemaID) (*dataset.Schema, error)
	FindAllDynamicByScene(context.Context, id.SceneID) (dataset.SchemaList, error)
	Save(context.Context, *dataset.Schema) error
	SaveAll(context.Context, dataset.SchemaList) error
	Remove(context.Context, id.DatasetSchemaID) error
	RemoveAll(context.Context, []id.DatasetSchemaID) error
	RemoveByScene(context.Context, id.SceneID) error
}
