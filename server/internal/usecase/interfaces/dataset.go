package interfaces

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type AddDatasetSchemaParam struct {
	SceneId             id.SceneID
	Name                string
	RepresentativeField *id.DatasetFieldID
}

type ImportDatasetParam struct {
	File     *file.File
	SceneId  id.SceneID
	SchemaId *id.DatasetSchemaID
}

type ImportDatasetFromGoogleSheetParam struct {
	Token     string
	FileID    string
	SheetName string
	SceneId   id.SceneID
	SchemaId  *id.DatasetSchemaID
}

type RemoveDatasetSchemaParam struct {
	SchemaID id.DatasetSchemaID
	Force    *bool
}

type UpdateDatasetSchemaParam struct {
	SchemaId id.DatasetSchemaID
	Name     string
}

var (
	ErrNoDataSourceAvailable error = errors.New("no datasource available")
	ErrDataSourceInvalidURL  error = errors.New("invalid url")
	ErrDatasetInvalidDepth   error = errors.New("invalid depth")
)

type Dataset interface {
	Fetch(context.Context, []id.DatasetID) (dataset.List, error)
	Export(context.Context, id.DatasetSchemaID, string, io.Writer, func(string, string)) error
	GraphFetch(context.Context, id.DatasetID, int, *usecase.Operator) (dataset.List, error)
	FetchSchema(context.Context, []id.DatasetSchemaID, *usecase.Operator) (dataset.SchemaList, error)
	ImportDataset(context.Context, ImportDatasetParam, *usecase.Operator) (*dataset.Schema, error)
	ImportDatasetFromGoogleSheet(context.Context, ImportDatasetFromGoogleSheetParam, *usecase.Operator) (*dataset.Schema, error)
	GraphFetchSchema(context.Context, id.DatasetSchemaID, int, *usecase.Operator) (dataset.SchemaList, error)
	FindBySchema(context.Context, id.DatasetSchemaID, *usecasex.Pagination, *usecase.Operator) (dataset.List, *usecasex.PageInfo, error)
	CountBySchema(context.Context, id.DatasetSchemaID) (int, error)
	FindSchemaByScene(context.Context, id.SceneID, *usecasex.Pagination, *usecase.Operator) (dataset.SchemaList, *usecasex.PageInfo, error)
	RemoveDatasetSchema(context.Context, RemoveDatasetSchemaParam, *usecase.Operator) (id.DatasetSchemaID, error)
	UpdateDatasetSchema(context.Context, UpdateDatasetSchemaParam, *usecase.Operator) (*dataset.Schema, error)
	Sync(context.Context, id.SceneID, string, *usecase.Operator) (dataset.SchemaList, dataset.List, error)
	AddDatasetSchema(context.Context, AddDatasetSchemaParam, *usecase.Operator) (*dataset.Schema, error)
}
