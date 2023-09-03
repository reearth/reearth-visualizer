package nlslayer

import (
	pl "github.com/reearth/reearth/server/pkg/layer"
)

type NLSLayer interface {
	Cloner
	ID() ID
	LayerType() LayerType
	Scene() SceneID
	Title() string
	IsVisible() bool
	SetVisible(bool)
	HasInfobox() bool
	Infobox() *pl.Infobox
	SetInfobox(*pl.Infobox)
	Tags() *pl.TagList
	Rename(string)
}

func ToNLSLayerGroup(l NLSLayer) *NLSLayerGroup {
	if lg, ok := l.(*NLSLayerGroup); ok {
		return lg
	}
	return nil
}

func ToNLSLayerGroupRef(l *NLSLayer) *NLSLayerGroup {
	if l == nil {
		return nil
	}
	l2 := *l
	if lg, ok := l2.(*NLSLayerGroup); ok {
		return lg
	}
	return nil
}

func ToNLSLayerSimple(l NLSLayer) *NLSLayerSimple {
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
	id        ID
	layerType LayerType
	scene     SceneID
	title     string
	visible   bool
	infobox   *pl.Infobox
	tags      *pl.TagList
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

func (l *layerBase) LayerType() LayerType {
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

func (l *layerBase) Rename(name string) {
	if l == nil {
		return
	}
	l.title = name
}

func (l *layerBase) Clone() *layerBase {
	if l == nil {
		return nil
	}

	cloned := &layerBase{
		id:        l.id,
		layerType: l.layerType,
		scene:     l.scene,
		title:     l.title,
		visible:   l.visible,
	}

	if l.infobox != nil {
		cloned.infobox = l.infobox.Clone()
	}

	if l.tags != nil {
		cloned.tags = l.tags.Clone()
	}

	return cloned
}
