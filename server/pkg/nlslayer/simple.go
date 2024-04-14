package nlslayer

import (
	pl "github.com/reearth/reearth/server/pkg/layer"
)

type NLSLayerSimple struct {
	layerBase
}

func (l *NLSLayerSimple) ID() ID {
	return l.layerBase.ID()
}

func (l *NLSLayerSimple) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.layerBase.IDRef()
}

func (l *NLSLayerSimple) LayerType() LayerType {
	return l.layerBase.LayerType()
}

func (l *NLSLayerSimple) Scene() SceneID {
	return l.layerBase.SceneField
}

func (l *NLSLayerSimple) LinkedDataset() *pl.DatasetID {
	return nil
}

func (l *NLSLayerSimple) Title() string {
	return l.layerBase.Title()
}

func (l *NLSLayerSimple) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.layerBase.VisibleField
}

func (l *NLSLayerSimple) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.layerBase.InfoboxField != nil
}

func (l *NLSLayerSimple) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.layerBase.InfoboxField
}

func (l *NLSLayerSimple) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.layerBase.VisibleField = visible
}

func (l *NLSLayerSimple) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.layerBase.InfoboxField = infobox
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

	clonedBase := l.layerBase.Clone()

	return &NLSLayerSimple{
		layerBase: *clonedBase,
	}
}

func (l *NLSLayerSimple) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.layerBase.IsSketchField
}

func (l *NLSLayerSimple) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.layerBase.IsSketchField = isSketch
}

func (l *NLSLayerSimple) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.layerBase.SketchField != nil
}

func (l *NLSLayerSimple) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.layerBase.SketchField
}

func (l *NLSLayerSimple) SetSketch(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.layerBase.SketchField = sketch
}
