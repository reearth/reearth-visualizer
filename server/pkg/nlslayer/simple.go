package nlslayer

import (
	pl"github.com/reearth/reearth/server/pkg/layer"
)

type NLSLayerSimple struct {
	layerBase
	data				*Data
	properties          *Properties
	defines 			*Defines
	events				*Events
	appearance			*Appearance
	common  			*LayerID
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

func (l *NLSLayerSimple) LayerType() string {
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

func (l *NLSLayerSimple) Infobox() *pl.Infobox {
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

func (l *NLSLayerSimple) SetInfobox(infobox *pl.Infobox) {
	if l == nil {
		return
	}
	l.layerBase.infobox = infobox
}

func (l *NLSLayerSimple) Tags() *pl.TagList {
	if l == nil {
		return nil
	}
	if l.layerBase.tags == nil {
		l.layerBase.tags = pl.NewTagList(nil)
	}
	return l.layerBase.tags
}

func (l *NLSLayerSimple) LayerRef() *NLSLayer {
	if l == nil {
		return nil
	}
	var layer NLSLayer = l
	return &layer
}

func (l *NLSLayerSimple) Data() *Data {
	if l == nil {
		return nil
	}
	return l.data
}

func (l *NLSLayerSimple) Properties() *Properties {
	if l == nil {
		return nil
	}
	return l.properties
}

func (l *NLSLayerSimple) Defines() *Defines {
	if l == nil {
		return nil
	}
	return l.defines
}

func (l *NLSLayerSimple) Events() *Events {
	if l == nil {
		return nil
	}
	return l.events
}

func (l *NLSLayerSimple) Appearance() *Appearance {
	if l == nil {
		return nil
	}
	return l.appearance
}


func (l *NLSLayerSimple) CommonLayer() *LayerID {
	if l == nil {
		return &LayerID{}
	}
	return l.common.CloneRef()
}