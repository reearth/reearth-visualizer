package scene

import (
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
)

type Builder struct {
	scene *Scene
}

func New() *Builder {
	return &Builder{scene: &Scene{}}
}

// Build _
func (b *Builder) Build() (*Scene, error) {
	if b.scene.id.ID().IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.scene.team.ID().IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.scene.rootLayer.ID().IsNil() {
		return nil, id.ErrInvalidID
	}
	if b.scene.widgetSystem == nil {
		b.scene.widgetSystem = NewWidgetSystem(nil)
	}
	if b.scene.widgetAlignSystem == nil {
		b.scene.widgetAlignSystem = NewWidgetAlignSystem()
	}
	if b.scene.pluginSystem == nil {
		b.scene.pluginSystem = NewPluginSystem(nil)
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
	b.scene.id = id.SceneID(id.New())
	return b
}

func (b *Builder) Project(prj id.ProjectID) *Builder {
	b.scene.project = prj
	return b
}

func (b *Builder) Team(team id.TeamID) *Builder {
	b.scene.team = team
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.scene.updatedAt = updatedAt
	return b
}

func (b *Builder) WidgetSystem(widgetSystem *WidgetSystem) *Builder {
	widgetSystem2 := *widgetSystem
	b.scene.widgetSystem = &widgetSystem2
	return b
}

func (b *Builder) WidgetAlignSystem(widgetAlignSystem *WidgetAlignSystem) *Builder {
	b.scene.widgetAlignSystem = widgetAlignSystem
	return b
}

func (b *Builder) RootLayer(rootLayer id.LayerID) *Builder {
	b.scene.rootLayer = rootLayer
	return b
}

func (b *Builder) PluginSystem(pluginSystem *PluginSystem) *Builder {
	pluginSystem2 := *pluginSystem
	b.scene.pluginSystem = &pluginSystem2
	return b
}

func (b *Builder) Property(p id.PropertyID) *Builder {
	b.scene.property = p
	return b
}
