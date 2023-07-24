package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type DatasetSchema interface {
	Filtered(SceneFilter) DatasetSchema
	FindByID(context.Context, id.DatasetSchemaID) (*dataset.Schema, error)
	FindByIDs(context.Context, id.DatasetSchemaIDList) (dataset.SchemaList, error)
	FindByScene(context.Context, id.SceneID, *usecasex.Pagination) (dataset.SchemaList, *usecasex.PageInfo, error)
	FindBySceneAll(context.Context, id.SceneID) (dataset.SchemaList, error)
	FindBySceneAndSource(context.Context, id.SceneID, string) (dataset.SchemaList, error)
	CountByScene(context.Context, id.SceneID) (int, error)
	Save(context.Context, *dataset.Schema) error
	SaveAll(context.Context, dataset.SchemaList) error
	Remove(context.Context, id.DatasetSchemaID) error
	RemoveAll(context.Context, id.DatasetSchemaIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}
