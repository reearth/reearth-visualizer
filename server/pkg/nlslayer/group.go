package nlslayer

type NLSLayerGroup struct {
	LayerBase
	children *IDList
	root     bool
}

func (l *NLSLayerGroup) ID() ID {
	return l.LayerBase.ID()
}

func (l *NLSLayerGroup) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.LayerBase.IDRef()
}

func (l *NLSLayerGroup) LayerType() LayerType {
	return l.LayerBase.LayerType()
}

func (l *NLSLayerGroup) Scene() SceneID {
	return l.LayerBase.SceneField
}

func (l *NLSLayerGroup) Title() string {
	return l.LayerBase.Title()
}

func (l *NLSLayerGroup) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.VisibleField
}

func (l *NLSLayerGroup) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.InfoboxField != nil
}

func (l *NLSLayerGroup) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.LayerBase.InfoboxField
}

func (l *NLSLayerGroup) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.LayerBase.VisibleField = visible
}

func (l *NLSLayerGroup) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.LayerBase.InfoboxField = infobox
}

func (l *NLSLayerGroup) Children() *IDList {
	if l == nil {
		return nil
	}
	if l.children == nil {
		l.children = NewIDList(nil)
	}
	return l.children
}

func (l *NLSLayerGroup) LayerRef() *NLSLayer {
	if l == nil {
		return nil
	}
	var layer NLSLayer = l
	return &layer
}

func (l *NLSLayerGroup) Config() *Config {
	if l == nil {
		return &Config{}
	}
	return l.ConfigField
}

func (l *NLSLayerGroup) IsRoot() bool {
	if l == nil {
		return false
	}
	return l.root
}

func (l *NLSLayerGroup) Clone() Cloner {
	if l == nil {
		return nil
	}

	clonedBase := l.LayerBase.Clone()
	clonedBaseTyped, ok := clonedBase.(*LayerBase)
	if !ok {
		return nil
	}

	var clonedChildren *IDList
	if l.children != nil {
		clonedChildren = l.children.Clone()
	}

	return &NLSLayerGroup{
		LayerBase: *clonedBaseTyped,
		children:  clonedChildren,
		root:      l.root,
	}
}

func (l *NLSLayerGroup) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.IsSketchField
}

func (l *NLSLayerGroup) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.LayerBase.IsSketchField = isSketch
}

func (l *NLSLayerGroup) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.SketchField != nil
}

func (l *NLSLayerGroup) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.LayerBase.SketchField
}

func (l *NLSLayerGroup) SetSketch(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.LayerBase.SketchField = sketch
}
