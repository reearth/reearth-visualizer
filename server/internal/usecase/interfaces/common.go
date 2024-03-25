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

type Container struct {
	Asset        Asset
	Dataset      Dataset
	Layer        Layer
	NLSLayer     NLSLayer
	Plugin       Plugin
	Policy       Policy
	Project      Project
	Property     Property
	Published    Published
	Scene        Scene
	Tag          Tag
	StoryTelling Storytelling
	Style        Style
	User         accountinterfaces.User
	Workspace    accountinterfaces.Workspace
}
