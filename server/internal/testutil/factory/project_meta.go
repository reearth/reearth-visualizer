package factory

import (
	"github.com/reearth/reearth/server/pkg/project"
)

type ProjectMetaOption func(*project.MetadataBuilder)

func NewProjectMeta(opts ...ProjectMetaOption) *project.ProjectMetadata {
	p := project.NewProjectMetadata().NewID()
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
