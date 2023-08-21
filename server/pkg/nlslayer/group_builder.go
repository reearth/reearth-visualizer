package nlslayer

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

func (b *NLSLayerGroupBuilder) Type(t string) *NLSLayerGroupBuilder {
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

func (b *NLSLayerGroupBuilder) CommonLayer(cl *LayerID) *NLSLayerGroupBuilder {
	b.l.common = cl
	return b
}
