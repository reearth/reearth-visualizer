package nlslayer

import (
	pl"github.com/reearth/reearth/server/pkg/layer"
)

type NLSLayer interface {
	ID() ID
	LayerType() string
	Scene() SceneID
	Title() string
	IsVisible() bool
	SetVisible(bool)
	HasInfobox() bool
	Infobox() *pl.Infobox
	SetInfobox(*pl.Infobox)
	Tags() *pl.TagList
	Creator() string
	Rename(string)
}

func ToLayerGroup(l NLSLayer) *NLSLayerGroup {
	if lg, ok := l.(*NLSLayerGroup); ok {
		return lg
	}
	return nil
}

func ToLayerGroupRef(l *NLSLayer) *NLSLayerGroup {
	if l == nil {
		return nil
	}
	l2 := *l
	if lg, ok := l2.(*NLSLayerGroup); ok {
		return lg
	}
	return nil
}

func ToLayerSimple(l NLSLayer) *NLSLayerSimple {
	if li, ok := l.(*NLSLayerSimple); ok {
		return li
	}
	return nil
}

func ToLayerSimpleRef(l *NLSLayer) *NLSLayerSimple {
	if l == nil {
		return nil
	}
	l2 := *l
	if li, ok := l2.(*NLSLayerSimple); ok {
		return li
	}
	return nil
}

type layerBase struct {
	id        		ID
	layerType		string
	scene     		SceneID
	title			string
	visible			bool
	infobox			*pl.Infobox
	tags      		*pl.TagList
	creator 		string
}

func (l *layerBase) ID() ID {
	return l.id
}

func (l *layerBase) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.id.Ref()
}

func (l *layerBase) LayerType() string {
	if l == nil {
		return ""
	}
	return l.layerType
}


func (l *layerBase) Scene() SceneID {
	return l.scene
}

func (l *layerBase) Title() string {
	if l == nil {
		return ""
	}
	return l.title
}

func (l *layerBase) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.visible
}

func (l *layerBase) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.infobox != nil
}

func (l *layerBase) Infobox() *pl.Infobox {
	if l == nil {
		return nil
	}
	return l.infobox
}

func (l *layerBase) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.visible = visible
}

func (l *layerBase) SetInfobox(infobox *pl.Infobox) {
	if l == nil {
		return
	}
	l.infobox = infobox
}

func (l *layerBase) Creator() string {
	if l == nil {
		return ""
	}
	return l.creator
}

func (l *layerBase) Rename(name string) {
	if l == nil {
		return
	}
	l.title = name
}
