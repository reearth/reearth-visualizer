package factory

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
)

type ProjectOption func(*project.Project)

func NewProject(opts ...ProjectOption) *project.Project {
	p := project.New().
		ID(id.NewProjectID()).
		Alias("alias").
		Visualizer(visualizer.VisualizerCesium).
		Description("description").
		MustBuild()
	for _, opt := range opts {
		opt(p)
	}
	return p
}
