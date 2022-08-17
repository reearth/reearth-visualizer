package asset

import (
	"errors"
	"time"
)

var (
	ErrEmptyWorkspaceID = errors.New("require workspace id")
	ErrEmptyURL         = errors.New("require valid url")
	ErrEmptySize        = errors.New("file size cannot be zero")
)

type Asset struct {
	id          ID
	createdAt   time.Time
	workspace   WorkspaceID
	name        string // file name
	size        int64  // file size
	url         string
	contentType string
}

func (a *Asset) ID() ID {
	return a.id
}

func (a *Asset) Workspace() WorkspaceID {
	return a.workspace
}

func (a *Asset) Name() string {
	return a.name
}

func (a *Asset) Size() int64 {
	return a.size
}

func (a *Asset) URL() string {
	return a.url
}

func (a *Asset) ContentType() string {
	return a.contentType
}

func (a *Asset) CreatedAt() time.Time {
	if a == nil {
		return time.Time{}
	}
	return a.id.Timestamp()
}
