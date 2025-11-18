package interfaces

import (
	"errors"

	accounts_interfaces "github.com/reearth/reearth-accounts/server/internal/usecase/interfaces"
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
	Asset           Asset
	NLSLayer        NLSLayer
	Plugin          Plugin
	Policy          Policy
	Project         Project
	ProjectMetadata ProjectMetadata
	Property        Property
	Published       Published
	Scene           Scene
	StoryTelling    Storytelling
	Style           Style
	User            accounts_interfaces.User
	Workspace       accounts_interfaces.Workspace
}
