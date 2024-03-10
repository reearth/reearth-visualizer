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
	return l.layerBase.scene
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
	return l.layerBase.visible
}

func (l *NLSLayerSimple) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.layerBase.infobox != nil
}

func (l *NLSLayerSimple) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.layerBase.infobox
}

func (l *NLSLayerSimple) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.layerBase.visible = visible
}

func (l *NLSLayerSimple) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.layerBase.infobox = infobox
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
	return l.config
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
