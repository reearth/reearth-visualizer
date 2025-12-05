package asset

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

var (
	ErrEmptyWorkspaceID = errors.New("require workspace id")
	ErrEmptyURL         = errors.New("require valid url")
	ErrEmptySize        = errors.New("file size cannot be zero")
)

type Asset struct {
	id          id.AssetID
	createdAt   time.Time
	workspace   accountsID.WorkspaceID
	project     *id.ProjectID
	name        string // file name
	size        int64  // file size
	url         string
	contentType string
	coreSupport bool
}

func (a *Asset) ID() id.AssetID {
	return a.id
}

func (a *Asset) Workspace() accountsID.WorkspaceID {
	return a.workspace
}

func (a *Asset) Project() *id.ProjectID {
	return a.project
}

func (a *Asset) SetProject(project *id.ProjectID) {
	a.project = project
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

func (a *Asset) CoreSupport() bool {
	return a.coreSupport
}

func (a *Asset) CreatedAt() time.Time {
	if a == nil {
		return time.Time{}
	}
	return a.id.Timestamp()
}
