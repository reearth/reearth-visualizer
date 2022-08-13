package interfaces

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/decoding"
	"github.com/reearth/reearth-backend/pkg/property"
)

type AddLayerItemInput struct {
	ParentLayerID   id.LayerID
	ExtensionID     *id.PluginExtensionID
	Index           *int
	LinkedDatasetID *id.DatasetID
	Name            string
	LatLng          *property.LatLng
}

type AddLayerGroupInput struct {
	ParentLayerID         id.LayerID
	ExtensionID           *id.PluginExtensionID
	Index                 *int
	LinkedDatasetSchemaID *id.DatasetSchemaID
	RepresentativeFieldId *id.DatasetFieldID
	Name                  string
}

type UpdateLayerInput struct {
	LayerID id.LayerID
	Name    *string
	Visible *bool
}

type MoveLayerInput struct {
	LayerID     id.LayerID
	DestLayerID *id.LayerID
	Index       int
}

type AddInfoboxFieldParam struct {
	LayerID     id.LayerID
	PluginID    id.PluginID
	ExtensionID id.PluginExtensionID
	Index       *int
}

type MoveInfoboxFieldParam struct {
	LayerID        id.LayerID
	InfoboxFieldID id.InfoboxFieldID
	Index          int
}

type RemoveInfoboxFieldParam struct {
	LayerID        id.LayerID
	InfoboxFieldID id.InfoboxFieldID
}
type ImportLayerParam struct {
	LayerID id.LayerID
	File    *file.File
	Format  decoding.LayerEncodingFormat
}

var (
	ErrParentLayerNotFound                  error = errors.New("parent layer not found")
	ErrPluginNotFound                       error = errors.New("plugin not found")
	ErrExtensionNotFound                    error = errors.New("extension not found")
	ErrInfoboxNotFound                      error = errors.New("infobox not found")
	ErrInfoboxAlreadyExists                 error = errors.New("infobox already exists")
	ErrCannotAddLayerToLinkedLayerGroup     error = errors.New("cannot add layer to linked layer group")
	ErrCannotRemoveLayerToLinkedLayerGroup  error = errors.New("cannot remove layer to linked layer group")
	ErrLinkedLayerItemCannotBeMoved         error = errors.New("linked layer item cannot be moved")
	ErrLayerCannotBeMovedToLinkedLayerGroup error = errors.New("layer cannot be moved to linked layer group")
	ErrCannotMoveLayerToOtherScene          error = errors.New("layer cannot layer to other scene")
	ErrExtensionTypeMustBePrimitive         error = errors.New("extension type must be primitive")
	ErrExtensionTypeMustBeBlock             error = errors.New("extension type must be block")
	ErrInvalidExtensionType                 error = errors.New("invalid extension type")
)

type Layer interface {
	Fetch(context.Context, []id.LayerID, *usecase.Operator) (layer.List, error)
	FetchGroup(context.Context, []id.LayerID, *usecase.Operator) ([]*layer.Group, error)
	FetchItem(context.Context, []id.LayerID, *usecase.Operator) ([]*layer.Item, error)
	FetchParent(context.Context, id.LayerID, *usecase.Operator) (*layer.Group, error)
	FetchByProperty(context.Context, id.PropertyID, *usecase.Operator) (layer.Layer, error)
	FetchMerged(context.Context, id.LayerID, *id.LayerID, *usecase.Operator) (*layer.Merged, error)
	FetchParentAndMerged(context.Context, id.LayerID, *usecase.Operator) (*layer.Merged, error)
	FetchByTag(context.Context, id.TagID, *usecase.Operator) (layer.List, error)
	Export(context.Context, id.LayerID, string) (io.Reader, string, error)
	AddItem(context.Context, AddLayerItemInput, *usecase.Operator) (*layer.Item, *layer.Group, error)
	AddGroup(context.Context, AddLayerGroupInput, *usecase.Operator) (*layer.Group, *layer.Group, error)
	Remove(context.Context, id.LayerID, *usecase.Operator) (id.LayerID, *layer.Group, error)
	Update(context.Context, UpdateLayerInput, *usecase.Operator) (layer.Layer, error)
	Move(context.Context, MoveLayerInput, *usecase.Operator) (id.LayerID, *layer.Group, *layer.Group, int, error)
	CreateInfobox(context.Context, id.LayerID, *usecase.Operator) (layer.Layer, error)
	RemoveInfobox(context.Context, id.LayerID, *usecase.Operator) (layer.Layer, error)
	AddInfoboxField(context.Context, AddInfoboxFieldParam, *usecase.Operator) (*layer.InfoboxField, layer.Layer, error)
	MoveInfoboxField(context.Context, MoveInfoboxFieldParam, *usecase.Operator) (id.InfoboxFieldID, layer.Layer, int, error)
	RemoveInfoboxField(context.Context, RemoveInfoboxFieldParam, *usecase.Operator) (id.InfoboxFieldID, layer.Layer, error)
	ImportLayer(context.Context, ImportLayerParam, *usecase.Operator) (layer.List, *layer.Group, error)
	AttachTag(context.Context, id.LayerID, id.TagID, *usecase.Operator) (layer.Layer, error)
	DetachTag(context.Context, id.LayerID, id.TagID, *usecase.Operator) (layer.Layer, error)
}
