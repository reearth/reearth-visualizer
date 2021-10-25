package layer

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
)

type Builder struct {
	base layerBase
}

func New() *Builder {
	return &Builder{base: layerBase{visible: true}}
}

func (b *Builder) Group() *GroupBuilder {
	return NewGroup().base(b.base)
}

func (b *Builder) Item() *ItemBuilder {
	return NewItem().base(b.base)
}

func (b *Builder) ID(id id.LayerID) *Builder {
	b.base.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.base.id = id.NewLayerID()
	return b
}

func (b *Builder) Scene(s id.SceneID) *Builder {
	b.base.scene = s
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.base.name = name
	return b
}

func (b *Builder) IsVisible(visible bool) *Builder {
	b.base.visible = visible
	return b
}

func (b *Builder) IsVisibleRef(visible *bool) *Builder {
	if visible != nil {
		b.base.visible = *visible
	}
	return b
}

func (b *Builder) Plugin(plugin *id.PluginID) *Builder {
	b.base.plugin = plugin.CopyRef()
	return b
}

func (b *Builder) Extension(extension *id.PluginExtensionID) *Builder {
	b.base.extension = extension.CopyRef()
	return b
}

func (b *Builder) Property(p *id.PropertyID) *Builder {
	b.base.property = p.CopyRef()
	return b
}

func (b *Builder) Infobox(infobox *Infobox) *Builder {
	b.base.infobox = infobox
	return b
}

func (b *Builder) Tags(tags *tag.List) *Builder {
	b.base.tags = tags
	return b
}
