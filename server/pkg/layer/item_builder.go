package layer

func ItemFromLayer(l Layer) *Item {
	li, ok := l.(*Item)
	if !ok {
		return nil
	}
	return li
}

func ItemFromLayerRef(l *Layer) *Item {
	if l == nil {
		return nil
	}
	li, ok := (*l).(*Item)
	if !ok {
		return nil
	}
	return li
}

type ItemBuilder struct {
	l *Item
}

func NewItem() *ItemBuilder {
	return &ItemBuilder{l: &Item{layerBase: layerBase{visible: true}}}
}

func (b *ItemBuilder) Build() (*Item, error) {
	if b.l.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.l, nil
}

func (b *ItemBuilder) MustBuild() *Item {
	item, err := b.Build()
	if err != nil {
		panic(err)
	}
	return item
}

func (b *ItemBuilder) base(layer layerBase) *ItemBuilder {
	b.l.layerBase = layer
	return b
}

func (b *ItemBuilder) ID(id ID) *ItemBuilder {
	b.l.id = id
	return b
}

func (b *ItemBuilder) NewID() *ItemBuilder {
	b.l.id = NewID()
	return b
}

func (b *ItemBuilder) Scene(s SceneID) *ItemBuilder {
	b.l.scene = s
	return b
}

func (b *ItemBuilder) Name(name string) *ItemBuilder {
	b.l.name = name
	return b
}

func (b *ItemBuilder) IsVisible(visible bool) *ItemBuilder {
	b.l.visible = visible
	return b
}

func (b *ItemBuilder) Plugin(plugin *PluginID) *ItemBuilder {
	b.l.plugin = plugin.CloneRef()
	return b
}

func (b *ItemBuilder) Extension(extension *PluginExtensionID) *ItemBuilder {
	b.l.extension = extension.CloneRef()
	return b
}

func (b *ItemBuilder) Property(p *PropertyID) *ItemBuilder {
	b.l.property = p.CloneRef()
	return b
}

func (b *ItemBuilder) Infobox(infobox *Infobox) *ItemBuilder {
	b.l.infobox = infobox
	return b
}

func (b *ItemBuilder) LinkedDataset(linkedDataset *DatasetID) *ItemBuilder {
	b.l.linkedDataset = linkedDataset.CloneRef()
	return b
}

func (b *ItemBuilder) Tags(tags *TagList) *ItemBuilder {
	b.l.tags = tags
	return b
}
