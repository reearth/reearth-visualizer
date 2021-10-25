package layer

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
)

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
	if id.ID(b.l.id).IsNil() {
		return nil, id.ErrInvalidID
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

func (b *ItemBuilder) ID(id id.LayerID) *ItemBuilder {
	b.l.id = id
	return b
}

func (b *ItemBuilder) NewID() *ItemBuilder {
	b.l.id = id.NewLayerID()
	return b
}

func (b *ItemBuilder) Scene(s id.SceneID) *ItemBuilder {
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

func (b *ItemBuilder) Plugin(plugin *id.PluginID) *ItemBuilder {
	b.l.plugin = plugin.CopyRef()
	return b
}

func (b *ItemBuilder) Extension(extension *id.PluginExtensionID) *ItemBuilder {
	b.l.extension = extension.CopyRef()
	return b
}

func (b *ItemBuilder) Property(p *id.PropertyID) *ItemBuilder {
	b.l.property = p.CopyRef()
	return b
}

func (b *ItemBuilder) Infobox(infobox *Infobox) *ItemBuilder {
	b.l.infobox = infobox
	return b
}

func (b *ItemBuilder) LinkedDataset(linkedDataset *id.DatasetID) *ItemBuilder {
	b.l.linkedDataset = linkedDataset.CopyRef()
	return b
}

func (b *ItemBuilder) Tags(tags *tag.List) *ItemBuilder {
	b.l.tags = tags
	return b
}
