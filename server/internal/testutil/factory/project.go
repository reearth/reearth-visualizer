package factory

import (
	"github.com/go-faker/faker/v4"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
)

type ProjectOption func(*project.Builder)

func NewProject(opts ...ProjectOption) *project.Project {
	pid := id.NewProjectID()
	p := project.New().
		ID(pid).
		Alias(pid.String()).
		PublishmentStatus(project.PublishmentStatusPublic).
		Description(faker.Word())
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
