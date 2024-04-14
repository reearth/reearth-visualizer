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
	return &NLSLayerSimpleBuilder{l: &NLSLayerSimple{LayerBase: LayerBase{}}}
}

func (b *NLSLayerSimpleBuilder) Build() (*NLSLayerSimple, error) {
	if b.l.IDField.IsNil() {
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

func (b *NLSLayerSimpleBuilder) base(layer LayerBase) *NLSLayerSimpleBuilder {
	b.l.LayerBase = layer
	return b
}

func (b *NLSLayerSimpleBuilder) ID(id ID) *NLSLayerSimpleBuilder {
	b.l.IDField = id
	return b
}

func (b *NLSLayerSimpleBuilder) NewID() *NLSLayerSimpleBuilder {
	b.l.IDField = NewID()
	return b
}

func (b *NLSLayerSimpleBuilder) LayerType(t LayerType) *NLSLayerSimpleBuilder {
	b.l.LayerTypeField = t
	return b
}

func (b *NLSLayerSimpleBuilder) Scene(s SceneID) *NLSLayerSimpleBuilder {
	b.l.SceneField = s
	return b
}

func (b *NLSLayerSimpleBuilder) Title(t string) *NLSLayerSimpleBuilder {
	b.l.TitleField = t
	return b
}

func (b *NLSLayerSimpleBuilder) IsVisible(i bool) *NLSLayerSimpleBuilder {
	b.l.VisibleField = i
	return b
}

func (b *NLSLayerSimpleBuilder) Infobox(infobox *Infobox) *NLSLayerSimpleBuilder {
	b.l.InfoboxField = infobox
	return b
}

func (b *NLSLayerSimpleBuilder) Config(c *Config) *NLSLayerSimpleBuilder {
	b.l.ConfigField = c
	return b
}

func (b *NLSLayerSimpleBuilder) IsSketch(i bool) *NLSLayerSimpleBuilder {
	b.l.IsSketchField = i
	return b
}

func (b *NLSLayerSimpleBuilder) Sketch(sketch *SketchInfo) *NLSLayerSimpleBuilder {
	b.l.SketchField = sketch
	return b
}
