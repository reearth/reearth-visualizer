package readme

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrEmptyWorkspaceID = errors.New("require workspace id")
	ErrEmptyURL         = errors.New("require valid url")
	ErrEmptySize        = errors.New("file size cannot be zero")
)

type Readme struct {
	id        id.ReadmeID
	project   id.ProjectID
	readme    string
	license   string
	createdAt time.Time
	updatedAt time.Time
}

func (r *Readme) ID() id.ReadmeID {
	return r.id
}

func (r *Readme) Project() id.ProjectID {
	return r.project
}

func (r *Readme) Readme() string {
	return r.readme
}

func (a *Readme) License() string {
	return a.license
}

func (r *Readme) CreatedAt() time.Time {
	if r == nil {
		return time.Time{}
	}
	return r.createdAt
}

func (r *Readme) UpdatedAt() time.Time {
	if r == nil {
		return time.Time{}
	}
	return r.updatedAt
}

func (r *Readme) SetCreatedAt(createdAt time.Time) {
	if r == nil {
		return
	}
	r.createdAt = createdAt
}

func (r *Readme) SetUpdatedAt(updatedAt time.Time) {
	if r == nil {
		return
	}
	r.updatedAt = updatedAt
}
