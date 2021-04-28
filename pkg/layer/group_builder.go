package layer

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

func GroupFromLayer(l Layer) *Group {
	li, ok := l.(*Group)
	if !ok {
		return nil
	}
	return li
}

func GroupFromLayerRef(l *Layer) *Group {
	if l == nil {
		return nil
	}
	li, ok := (*l).(*Group)
	if !ok {
		return nil
	}
	return li
}

type GroupBuilder struct {
	l *Group
}

func NewGroup() *GroupBuilder {
	return &GroupBuilder{l: &Group{layerBase: layerBase{visible: true}}}
}

func (b *GroupBuilder) Build() (*Group, error) {
	if id.ID(b.l.id).IsNil() {
		return nil, id.ErrInvalidID
	}
	return b.l, nil
}

func (b *GroupBuilder) MustBuild() *Group {
	group, err := b.Build()
	if err != nil {
		panic(err)
	}
	return group
}

func (b *GroupBuilder) base(layer layerBase) *GroupBuilder {
	b.l.layerBase = layer
	return b
}

func (b *GroupBuilder) ID(id id.LayerID) *GroupBuilder {
	b.l.id = id
	return b
}

func (b *GroupBuilder) NewID() *GroupBuilder {
	b.l.id = id.NewLayerID()
	return b
}

func (b *GroupBuilder) Scene(s id.SceneID) *GroupBuilder {
	b.l.scene = s
	return b
}

func (b *GroupBuilder) Root(root bool) *GroupBuilder {
	b.l.root = root
	return b
}

func (b *GroupBuilder) Name(name string) *GroupBuilder {
	b.l.name = name
	return b
}

func (b *GroupBuilder) IsVisible(visible bool) *GroupBuilder {
	b.l.visible = visible
	return b
}

func (b *GroupBuilder) Plugin(plugin *id.PluginID) *GroupBuilder {
	b.l.plugin = plugin.CopyRef()
	return b
}

func (b *GroupBuilder) Extension(extension *id.PluginExtensionID) *GroupBuilder {
	b.l.extension = extension.CopyRef()
	return b
}

func (b *GroupBuilder) Property(property *id.PropertyID) *GroupBuilder {
	b.l.property = property.CopyRef()
	return b
}

func (b *GroupBuilder) Layers(ll *IDList) *GroupBuilder {
	b.l.layers = ll
	return b
}

func (b *GroupBuilder) Infobox(infobox *Infobox) *GroupBuilder {
	b.l.infobox = infobox
	return b
}

func (b *GroupBuilder) LinkedDatasetSchema(linkedDatasetSchema *id.DatasetSchemaID) *GroupBuilder {
	b.l.linkedDatasetSchema = linkedDatasetSchema.CopyRef()
	return b
}
