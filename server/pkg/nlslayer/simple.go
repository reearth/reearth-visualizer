package nlslayer

import (
	pl "github.com/reearth/reearth/server/pkg/layer"
)

type NLSLayerSimple struct {
	LayerBase
}

func (l *NLSLayerSimple) ID() ID {
	return l.LayerBase.ID()
}

func (l *NLSLayerSimple) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.LayerBase.IDRef()
}

func (l *NLSLayerSimple) LayerType() LayerType {
	return l.LayerBase.LayerType()
}

func (l *NLSLayerSimple) Scene() SceneID {
	return l.LayerBase.SceneField
}

func (l *NLSLayerSimple) LinkedDataset() *pl.DatasetID {
	return nil
}

func (l *NLSLayerSimple) Title() string {
	return l.LayerBase.Title()
}

func (l *NLSLayerSimple) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.VisibleField
}

func (l *NLSLayerSimple) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.InfoboxField != nil
}

func (l *NLSLayerSimple) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.LayerBase.InfoboxField
}

func (l *NLSLayerSimple) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.LayerBase.VisibleField = visible
}

func (l *NLSLayerSimple) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.LayerBase.InfoboxField = infobox
}

func (l *NLSLayerSimple) LayerRef() *NLSLayer {
	if l == nil {
		return nil
	}
	var layer NLSLayer = l
	return &layer
}

func (l *NLSLayerSimple) Config() *Config {
	if l == nil {
		return nil
	}
	return l.ConfigField
}

func (l *NLSLayerSimple) Clone() Cloner {
	if l == nil {
		return nil
	}

	clonedBase := l.LayerBase.Clone()
	clonedBaseTyped, ok := clonedBase.(*LayerBase)
	if !ok {
		return nil
	}

	return &NLSLayerSimple{
		LayerBase: *clonedBaseTyped,
	}
}

func (l *NLSLayerSimple) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.IsSketchField
}

func (l *NLSLayerSimple) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.LayerBase.IsSketchField = isSketch
}

func (l *NLSLayerSimple) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.LayerBase.SketchField != nil
}

func (l *NLSLayerSimple) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.LayerBase.SketchField
}

func (l *NLSLayerSimple) SetSketch(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.LayerBase.SketchField = sketch
}
