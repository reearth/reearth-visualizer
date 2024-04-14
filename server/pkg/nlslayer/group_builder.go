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
	return &NLSLayerGroupBuilder{l: &NLSLayerGroup{LayerBase: LayerBase{}}}
}

func (b *NLSLayerGroupBuilder) Build() (*NLSLayerGroup, error) {
	if b.l.IDField.IsNil() {
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

func (b *NLSLayerGroupBuilder) base(layer LayerBase) *NLSLayerGroupBuilder {
	b.l.LayerBase = layer
	return b
}

func (b *NLSLayerGroupBuilder) ID(id ID) *NLSLayerGroupBuilder {
	b.l.IDField = id
	return b
}

func (b *NLSLayerGroupBuilder) NewID() *NLSLayerGroupBuilder {
	b.l.IDField = NewID()
	return b
}

func (b *NLSLayerGroupBuilder) LayerType(t LayerType) *NLSLayerGroupBuilder {
	b.l.LayerTypeField = t
	return b
}

func (b *NLSLayerGroupBuilder) Scene(s SceneID) *NLSLayerGroupBuilder {
	b.l.SceneField = s
	return b
}

func (b *NLSLayerGroupBuilder) Layers(ll *IDList) *NLSLayerGroupBuilder {
	b.l.children = ll
	return b
}

func (b *NLSLayerGroupBuilder) Config(c *Config) *NLSLayerGroupBuilder {
	b.l.ConfigField = c
	return b
}

func (b *NLSLayerGroupBuilder) Title(t string) *NLSLayerGroupBuilder {
	b.l.TitleField = t
	return b
}

func (b *NLSLayerGroupBuilder) Root(r bool) *NLSLayerGroupBuilder {
	b.l.root = r
	return b
}

func (b *NLSLayerGroupBuilder) IsVisible(i bool) *NLSLayerGroupBuilder {
	b.l.VisibleField = i
	return b
}

func (b *NLSLayerGroupBuilder) Infobox(infobox *Infobox) *NLSLayerGroupBuilder {
	b.l.InfoboxField = infobox
	return b
}

func (b *NLSLayerGroupBuilder) IsSketch(i bool) *NLSLayerGroupBuilder {
	b.l.IsSketchField = i
	return b
}

func (b *NLSLayerGroupBuilder) Sketch(sketch *SketchInfo) *NLSLayerGroupBuilder {
	b.l.SketchField = sketch
	return b
}
