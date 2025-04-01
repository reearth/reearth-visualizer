package scene

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type Builder struct {
	scene *Scene
}

func New() *Builder {
	return &Builder{scene: &Scene{}}
}

func (b *Builder) Build() (*Scene, error) {
	if b.scene.id.IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.scene.workspace.IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.scene.widgets == nil {
		b.scene.widgets = NewWidgets(nil, nil)
	}
	if b.scene.plugins == nil {
		b.scene.plugins = NewPlugins(nil)
	}
	if b.scene.updatedAt.IsZero() {
		b.scene.updatedAt = b.scene.CreatedAt()
	}
	return b.scene, nil
}

func (b *Builder) MustBuild() *Scene {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id id.SceneID) *Builder {
	b.scene.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.scene.id = id.NewSceneID()
	return b
}

func (b *Builder) Project(prj id.ProjectID) *Builder {
	b.scene.project = prj
	return b
}

func (b *Builder) Workspace(workspace accountdomain.WorkspaceID) *Builder {
	b.scene.workspace = workspace
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.scene.updatedAt = updatedAt
	return b
}

func (b *Builder) Widgets(widgets *Widgets) *Builder {
	b.scene.widgets = widgets
	return b
}

func (b *Builder) Plugins(plugins *Plugins) *Builder {
	b.scene.plugins = plugins
	return b
}

func (b *Builder) Property(p id.PropertyID) *Builder {
	b.scene.property = p
	return b
}

func (b *Builder) Styles(sl *StyleList) *Builder {
	b.scene.styles = sl
	return b
}
