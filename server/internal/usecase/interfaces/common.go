package interfaces

import (
	"errors"

	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
)

type ListOperation string

const (
	ListOperationAdd    ListOperation = "add"
	ListOperationMove   ListOperation = "move"
	ListOperationRemove ListOperation = "remove"
)

var (
	ErrSceneIsLocked   error = errors.New("scene is locked")
	ErrOperationDenied error = errors.New("operation denied")
	ErrFileNotIncluded error = errors.New("file not included")
	ErrFeatureNotFound error = errors.New("feature not found")
)

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
	ErrSketchNotFound                       error = errors.New("sketch not found")
	ErrFeatureCollectionNotFound            error = errors.New("featureCollection not found")
)

type Container struct {
	Asset        Asset
	NLSLayer     NLSLayer
	Plugin       Plugin
	Policy       Policy
	Project      Project
	Property     Property
	Published    Published
	Scene        Scene
	StoryTelling Storytelling
	Style        Style
	User         accountinterfaces.User
	Workspace    accountinterfaces.Workspace
}
