package nlslayer

import (
	pl "github.com/reearth/reearth/server/pkg/layer"
)

func NLSLayerGroupFromLayer(l NLSLayer) *NLSLayerGroup {
	li, ok := l.(*NLSLayerGroup)
	if !ok {
		return nil
	}
	return li
}

func NLSLayerGroupFromLayerRef(l *NLSLayer) *NLSLayerGroup {
	if l == nil {
		return nil
	}
	li, ok := (*l).(*NLSLayerGroup)
	if !ok {
		return nil
	}
	return li
}

type NLSLayerGroupBuilder struct {
	l *NLSLayerGroup
}

func NewNLSLayerGroup() *NLSLayerGroupBuilder {
	return &NLSLayerGroupBuilder{l: &NLSLayerGroup{layerBase: layerBase{}}}
}

func (b *NLSLayerGroupBuilder) Build() (*NLSLayerGroup, error) {
	if b.l.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.l, nil
}

func (b *NLSLayerGroupBuilder) MustBuild() *NLSLayerGroup {
	group, err := b.Build()
	if err != nil {
		panic(err)
	}
	return group
}

func (b *NLSLayerGroupBuilder) base(layer layerBase) *NLSLayerGroupBuilder {
	b.l.layerBase = layer
	return b
}

func (b *NLSLayerGroupBuilder) ID(id ID) *NLSLayerGroupBuilder {
	b.l.id = id
	return b
}

func (b *NLSLayerGroupBuilder) NewID() *NLSLayerGroupBuilder {
	b.l.id = NewID()
	return b
}

func (b *NLSLayerGroupBuilder) LayerType(t LayerType) *NLSLayerGroupBuilder {
	b.l.layerType = t
	return b
}

func (b *NLSLayerGroupBuilder) Scene(s SceneID) *NLSLayerGroupBuilder {
	b.l.scene = s
	return b
}

func (b *NLSLayerGroupBuilder) Layers(ll *IDList) *NLSLayerGroupBuilder {
	b.l.children = ll
	return b
}

func (b *NLSLayerGroupBuilder) Config(c *Config) *NLSLayerGroupBuilder {
	b.l.config = c
	return b
}

func (b *NLSLayerGroupBuilder) Title(t string) *NLSLayerGroupBuilder {
	b.l.title = t
	return b
}

func (b *NLSLayerGroupBuilder) Root(r bool) *NLSLayerGroupBuilder {
	b.l.root = r
	return b
}

func (b *NLSLayerGroupBuilder) IsVisible(i bool) *NLSLayerGroupBuilder {
	b.l.visible = i
	return b
}

func (b *NLSLayerGroupBuilder) Infobox(infobox *pl.Infobox) *NLSLayerGroupBuilder {
	b.l.infobox = infobox
	return b
}

func (b *NLSLayerGroupBuilder) Tags(tags *pl.TagList) *NLSLayerGroupBuilder {
	b.l.tags = tags
	return b
}
