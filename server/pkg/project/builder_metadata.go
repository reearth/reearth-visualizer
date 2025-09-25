package project

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type MetadataBuilder struct {
	r *ProjectMetadata
}

func NewProjectMetadata() *MetadataBuilder {
	return &MetadataBuilder{r: &ProjectMetadata{}}
}

func (b *MetadataBuilder) Build() (*ProjectMetadata, error) {
	if b.r.id.IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.r.updatedAt == nil || b.r.updatedAt.IsZero() {
		b.r.updatedAt = b.r.UpdatedAt()
	}
	if b.r.createdAt == nil || b.r.createdAt.IsZero() {
		b.r.createdAt = b.r.CreatedAt()
	}
	return b.r, nil
}

func (b *MetadataBuilder) MustBuild() *ProjectMetadata {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *MetadataBuilder) ID(id id.ProjectMetadataID) *MetadataBuilder {
	b.r.id = id
	return b
}

func (b *MetadataBuilder) NewID() *MetadataBuilder {
	b.r.id = id.NewProjectMetadataID()
	return b
}

func (b *MetadataBuilder) Workspace(workspace accountdomain.WorkspaceID) *MetadataBuilder {
	b.r.workspace = workspace
	return b
}

func (b *MetadataBuilder) Project(project id.ProjectID) *MetadataBuilder {
	b.r.project = project
	return b
}

func (b *MetadataBuilder) ImportStatus(importStatus *ProjectImportStatus) *MetadataBuilder {
	b.r.importStatus = importStatus
	return b
}

func (b *MetadataBuilder) ImportResultLog(importResultLog *map[string]any) *MetadataBuilder {
	b.r.importResultLog = importResultLog
	return b
}

func (b *MetadataBuilder) Readme(readme *string) *MetadataBuilder {
	b.r.readme = readme
	return b
}

func (b *MetadataBuilder) License(license *string) *MetadataBuilder {
	b.r.license = license
	return b
}

func (b *MetadataBuilder) Topics(topics *string) *MetadataBuilder {
	b.r.topics = topics
	return b
}

func (b *MetadataBuilder) CreatedAt(createdAt *time.Time) *MetadataBuilder {
	b.r.createdAt = createdAt
	return b
}

func (b *MetadataBuilder) UpdatedAt(updatedAt *time.Time) *MetadataBuilder {
	b.r.updatedAt = updatedAt
	return b
}
