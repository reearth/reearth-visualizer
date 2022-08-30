package layer

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

func (b *Builder) ID(id ID) *Builder {
	b.base.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.base.id = NewID()
	return b
}

func (b *Builder) Scene(s SceneID) *Builder {
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

func (b *Builder) Plugin(plugin *PluginID) *Builder {
	b.base.plugin = plugin.CloneRef()
	return b
}

func (b *Builder) Extension(extension *PluginExtensionID) *Builder {
	b.base.extension = extension.CloneRef()
	return b
}

func (b *Builder) Property(p *PropertyID) *Builder {
	b.base.property = p.CloneRef()
	return b
}

func (b *Builder) Infobox(infobox *Infobox) *Builder {
	b.base.infobox = infobox
	return b
}

func (b *Builder) Tags(tags *TagList) *Builder {
	b.base.tags = tags
	return b
}
