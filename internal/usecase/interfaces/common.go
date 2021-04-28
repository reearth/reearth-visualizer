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
