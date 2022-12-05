package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
)

type UpdatePropertyValueParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
	Value      *property.Value
}

type RemovePropertyFieldParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
}

type UploadFileParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
	File       *file.File
}

type LinkPropertyValueParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
	Links      *property.Links
}

type UnlinkPropertyValueParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
}

type AddPropertyItemParam struct {
	PropertyID     id.PropertyID
	Pointer        *property.Pointer
	Index          *int
	NameFieldValue *property.Value
}

type MovePropertyItemParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
	Index      int
}

type RemovePropertyItemParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
}

type UpdatePropertyItemsParam struct {
	PropertyID id.PropertyID
	Pointer    *property.Pointer
	Operations []UpdatePropertyItemsOperationParam
}

type UpdatePropertyItemsOperationParam struct {
	Operation      ListOperation
	ItemID         *id.PropertyItemID
	Index          *int
	NameFieldValue *property.Value
}

var (
	ErrPropertyNotFound              error = errors.New("property not found")
	ErrPropertyInvalidType           error = errors.New("property invalid type")
	ErrInvalidFile                   error = errors.New("invalid file")
	ErrFailedToUploadFile            error = errors.New("failed to upload file")
	ErrPropertySchemaMustBeSpecified error = errors.New("property schema must be specified")
	ErrInvalidDatasetFieldID         error = errors.New("invalid dataset field id")
	ErrInvalidPropertyLinks          error = errors.New("invalid property links")
	ErrInvalidPropertyValue          error = errors.New("invalid property value")
)

type Property interface {
	Fetch(context.Context, []id.PropertyID, *usecase.Operator) ([]*property.Property, error)
	FetchSchema(context.Context, []id.PropertySchemaID, *usecase.Operator) ([]*property.Schema, error)
	FetchMerged(context.Context, *id.PropertyID, *id.PropertyID, *id.DatasetID, *usecase.Operator) (*property.Merged, error)
	UpdateValue(context.Context, UpdatePropertyValueParam, *usecase.Operator) (*property.Property, *property.GroupList, *property.Group, *property.Field, error)
	RemoveField(context.Context, RemovePropertyFieldParam, *usecase.Operator) (*property.Property, error)
	LinkValue(context.Context, LinkPropertyValueParam, *usecase.Operator) (*property.Property, *property.GroupList, *property.Group, *property.Field, error)
	UnlinkValue(context.Context, UnlinkPropertyValueParam, *usecase.Operator) (*property.Property, *property.GroupList, *property.Group, *property.Field, error)
	AddItem(context.Context, AddPropertyItemParam, *usecase.Operator) (*property.Property, *property.GroupList, *property.Group, error)
	MoveItem(context.Context, MovePropertyItemParam, *usecase.Operator) (*property.Property, *property.GroupList, *property.Group, error)
	RemoveItem(context.Context, RemovePropertyItemParam, *usecase.Operator) (*property.Property, error)
	UpdateItems(context.Context, UpdatePropertyItemsParam, *usecase.Operator) (*property.Property, error)
}
