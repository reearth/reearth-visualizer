package nlslayer

func NLSLayerSimpleFromLayer(l NLSLayer) *NLSLayerSimple {
	li, ok := l.(*NLSLayerSimple)
	if !ok {
		return nil
	}
	return li
}

func NLSLayerSimpleFromLayerRef(l *NLSLayer) *NLSLayerSimple {
	if l == nil {
		return nil
	}
	li, ok := (*l).(*NLSLayerSimple)
	if !ok {
		return nil
	}
	return li
}

type NLSLayerSimpleBuilder struct {
	l *NLSLayerSimple
}

func NewNLSLayerSimple() *NLSLayerSimpleBuilder {
	return &NLSLayerSimpleBuilder{l: &NLSLayerSimple{layerBase: layerBase{}}}
}

func (b *NLSLayerSimpleBuilder) Build() (*NLSLayerSimple, error) {
	if b.l.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.l, nil
}

func (b *NLSLayerSimpleBuilder) MustBuild() *NLSLayerSimple {
	Simple, err := b.Build()
	if err != nil {
		panic(err)
	}
	return Simple
}

func (b *NLSLayerSimpleBuilder) base(layer layerBase) *NLSLayerSimpleBuilder {
	b.l.layerBase = layer
	return b
}

func (b *NLSLayerSimpleBuilder) ID(id ID) *NLSLayerSimpleBuilder {
	b.l.id = id
	return b
}

func (b *NLSLayerSimpleBuilder) NewID() *NLSLayerSimpleBuilder {
	b.l.id = NewID()
	return b
}

func (b *NLSLayerSimpleBuilder) LayerType(t LayerType) *NLSLayerSimpleBuilder {
	b.l.layerType = t
	return b
}

func (b *NLSLayerSimpleBuilder) Scene(s SceneID) *NLSLayerSimpleBuilder {
	b.l.scene = s
	return b
}

func (b *NLSLayerSimpleBuilder) Title(t string) *NLSLayerSimpleBuilder {
	b.l.title = t
	return b
}

func (b *NLSLayerSimpleBuilder) IsVisible(i bool) *NLSLayerSimpleBuilder {
	b.l.visible = i
	return b
}

func (b *NLSLayerSimpleBuilder) Infobox(infobox *Infobox) *NLSLayerSimpleBuilder {
	b.l.infobox = infobox
	return b
}

func (b *NLSLayerSimpleBuilder) Config(c *Config) *NLSLayerSimpleBuilder {
	b.l.config = c
	return b
}
