package interfaces

import "errors"

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
)

type Container struct {
	Asset        Asset
	Dataset      Dataset
	Layer        Layer
	NLSLayer	 NLSLayer
	Plugin       Plugin
	Project      Project
	Property     Property
	Published    Published
	Scene        Scene
	Tag          Tag
	Workspace    Workspace
	User         User
	StoryTelling Storytelling
}
