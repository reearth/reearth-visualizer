package project

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

var (
	ErrEmptyWorkspaceID = errors.New("require workspace id")
	ErrEmptyURL         = errors.New("require valid url")
	ErrEmptySize        = errors.New("file size cannot be zero")
)

type ProjectMetadata struct {
	id           id.ProjectMetadataID
	workspace    accountdomain.WorkspaceID
	project      id.ProjectID
	importStatus *ProjectImportStatus
	readme       *string
	license      *string
	createdAt    *time.Time
	updatedAt    *time.Time
}

func (r *ProjectMetadata) ID() id.ProjectMetadataID {
	return r.id
}

func (r *ProjectMetadata) Workspace() accountdomain.WorkspaceID {
	if r == nil {
		return accountdomain.WorkspaceID{}
	}
	return r.workspace
}

func (r *ProjectMetadata) Project() id.ProjectID {
	return r.project
}

func (r *ProjectMetadata) Readme() *string {
	return r.readme
}

func (r *ProjectMetadata) ImportStatus() *ProjectImportStatus {
	return r.importStatus
}

func (r *ProjectMetadata) License() *string {
	return r.license
}

func (r *ProjectMetadata) CreatedAt() *time.Time {
	if r.createdAt == nil {
		currentTime := time.Now().UTC()
		r.createdAt = &currentTime
	}
	return r.createdAt
}

func (r *ProjectMetadata) UpdatedAt() *time.Time {
	if r.updatedAt == nil {
		currentTime := time.Now().UTC()
		r.updatedAt = &currentTime
	}
	return r.updatedAt
}

func (r *ProjectMetadata) SetImportStatus(importStatus *ProjectImportStatus) {
	if r == nil {
		return
	}
	r.importStatus = importStatus
}

func (r *ProjectMetadata) SetReadme(readme *string) {
	if r == nil {
		return
	}
	r.readme = readme
}

func (r *ProjectMetadata) SetLicense(license *string) {
	if r == nil {
		return
	}
	r.license = license
}

func (r *ProjectMetadata) SetCreatedAt(createdAt *time.Time) {
	if r == nil {
		return
	}
	r.createdAt = createdAt
}

func (r *ProjectMetadata) SetUpdatedAt(updatedAt *time.Time) {
	if r == nil {
		return
	}
	r.updatedAt = updatedAt
}
