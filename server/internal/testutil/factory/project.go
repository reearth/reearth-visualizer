package factory

import (
	"net/url"

	"github.com/go-faker/faker/v4"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/samber/lo"
)

type ProjectOption func(*project.Builder)

func NewProject(opts ...ProjectOption) *project.Project {
	pid := id.NewProjectID()
	p := project.New().
		ID(pid).
		Name(faker.Name()).
		Alias(pid.String()).
		PublishmentStatus(project.PublishmentStatusPublic).
		Visualizer(visualizer.VisualizerCesium).
		ImageURL(lo.Must(url.Parse(faker.URL()))).
		CoreSupport(true).
		Description(faker.Word())
	for _, opt := range opts {
		opt(p)
	}
	return p.MustBuild()
}
