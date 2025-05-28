package projectmetadata

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

type ProjectMetadata struct {
	id        id.ProjectMetadataID
	project   id.ProjectID
	readme    string
	license   string
	createdAt time.Time
	updatedAt time.Time
}

func (r *ProjectMetadata) ID() id.ProjectMetadataID {
	return r.id
}

func (r *ProjectMetadata) Project() id.ProjectID {
	return r.project
}

func (r *ProjectMetadata) Readme() string {
	return r.readme
}

func (a *ProjectMetadata) License() string {
	return a.license
}

func (r *ProjectMetadata) CreatedAt() time.Time {
	if r == nil {
		return time.Time{}
	}
	return r.createdAt
}

func (r *ProjectMetadata) UpdatedAt() time.Time {
	if r == nil {
		return time.Time{}
	}
	return r.updatedAt
}

func (r *ProjectMetadata) SetCreatedAt(createdAt time.Time) {
	if r == nil {
		return
	}
	r.createdAt = createdAt
}

func (r *ProjectMetadata) SetUpdatedAt(updatedAt time.Time) {
	if r == nil {
		return
	}
	r.updatedAt = updatedAt
}
