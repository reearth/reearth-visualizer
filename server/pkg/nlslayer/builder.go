package nlslayer

import "github.com/reearth/reearth/server/pkg/id"

type Builder struct {
	base layerBase
}

func New() *Builder {
	return &Builder{base: layerBase{}}
}

func (b *Builder) Group() *NLSLayerGroupBuilder {
	return NewNLSLayerGroup().base(b.base)
}

func (b *Builder) Simple() *NLSLayerSimpleBuilder {
	return NewNLSLayerSimple().base(b.base)
}

func (b *Builder) ID(id id.NLSLayerID) *Builder {
	b.base.id = id
	return b
}

func (b *Builder) Index(index *int) *Builder {
	b.base.index = index
	return b
}

func (b *Builder) NewID() *Builder {
	b.base.id = id.NewNLSLayerID()
	return b
}

func (b *Builder) Scene(s id.SceneID) *Builder {
	b.base.scene = s
	return b
}

func (b *Builder) LayerType(t LayerType) *Builder {
	b.base.layerType = t
	return b
}

func (b *Builder) Infobox(infobox *Infobox) *Builder {
	b.base.infobox = infobox
	return b
}
