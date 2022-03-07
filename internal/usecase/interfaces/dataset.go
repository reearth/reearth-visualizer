package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
)

type AddDatasetSchemaParam struct {
	SceneId             id.SceneID
	Name                string
	RepresentativeField *id.DatasetSchemaFieldID
}

type AddDynamicDatasetSchemaParam struct {
	SceneId id.SceneID
}

type AddDynamicDatasetParam struct {
	SchemaId id.DatasetSchemaID
	Author   string
	Content  string
	Target   *string
	Lat      *float64
	Lng      *float64
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
	Fetch(context.Context, []id.DatasetID, *usecase.Operator) (dataset.List, error)
	GraphFetch(context.Context, id.DatasetID, int, *usecase.Operator) (dataset.List, error)
	FetchSchema(context.Context, []id.DatasetSchemaID, *usecase.Operator) (dataset.SchemaList, error)
	ImportDataset(context.Context, ImportDatasetParam, *usecase.Operator) (*dataset.Schema, error)
	ImportDatasetFromGoogleSheet(context.Context, ImportDatasetFromGoogleSheetParam, *usecase.Operator) (*dataset.Schema, error)
	GraphFetchSchema(context.Context, id.DatasetSchemaID, int, *usecase.Operator) (dataset.SchemaList, error)
	AddDynamicDatasetSchema(context.Context, AddDynamicDatasetSchemaParam) (*dataset.Schema, error)
	AddDynamicDataset(context.Context, AddDynamicDatasetParam) (*dataset.Schema, *dataset.Dataset, error)
	FindBySchema(context.Context, id.DatasetSchemaID, *usecase.Pagination, *usecase.Operator) (dataset.List, *usecase.PageInfo, error)
	FindSchemaByScene(context.Context, id.SceneID, *usecase.Pagination, *usecase.Operator) (dataset.SchemaList, *usecase.PageInfo, error)
	FindDynamicSchemaByScene(context.Context, id.SceneID) (dataset.SchemaList, error)
	RemoveDatasetSchema(context.Context, RemoveDatasetSchemaParam, *usecase.Operator) (id.DatasetSchemaID, error)
	UpdateDatasetSchema(context.Context, UpdateDatasetSchemaParam, *usecase.Operator) (*dataset.Schema, error)
	Sync(context.Context, id.SceneID, string, *usecase.Operator) (dataset.SchemaList, dataset.List, error)
	AddDatasetSchema(context.Context, AddDatasetSchemaParam, *usecase.Operator) (*dataset.Schema, error)
}
