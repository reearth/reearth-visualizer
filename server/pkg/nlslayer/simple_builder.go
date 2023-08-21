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

func (b *NLSLayerSimpleBuilder) Type(t string) *NLSLayerSimpleBuilder {
	b.l.layerType = t
	return b
}

func (b *NLSLayerSimpleBuilder) Scene(s SceneID) *NLSLayerSimpleBuilder {
	b.l.scene = s
	return b
}

func (b *NLSLayerSimpleBuilder) Data(d *Data) *NLSLayerSimpleBuilder {
	b.l.data = d
	return b
}

func (b *NLSLayerSimpleBuilder) Properties(p *Properties) *NLSLayerSimpleBuilder {
	b.l.properties = p
	return b
}

func (b *NLSLayerSimpleBuilder) Defines(p *Defines) *NLSLayerSimpleBuilder {
	b.l.defines = p
	return b
}

func (b *NLSLayerSimpleBuilder) Events(e *Events) *NLSLayerSimpleBuilder {
	b.l.events = e
	return b
}

func (b *NLSLayerSimpleBuilder) Appearance(a *Appearance) *NLSLayerSimpleBuilder {
	b.l.appearance = a
	return b
}

func (b *NLSLayerSimpleBuilder) CommonLayer(cl *LayerID) *NLSLayerSimpleBuilder {
	b.l.common = cl
	return b
}
