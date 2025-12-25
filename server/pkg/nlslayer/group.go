package nlslayer

import "github.com/reearth/reearth/server/pkg/id"

type NLSLayerGroup struct {
	layerBase
	children *IDList
	root     bool
}

func (l *NLSLayerGroup) ID() id.NLSLayerID {
	return l.layerBase.ID()
}

func (l *NLSLayerGroup) IDRef() *id.NLSLayerID {
	if l == nil {
		return nil
	}
	return l.layerBase.IDRef()
}

func (l *NLSLayerGroup) LayerType() LayerType {
	return l.layerBase.LayerType()
}

func (l *NLSLayerGroup) Scene() id.SceneID {
	return l.scene
}

func (l *NLSLayerGroup) Title() string {
	return l.layerBase.Title()
}

func (l *NLSLayerGroup) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.visible
}

func (l *NLSLayerGroup) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.infobox != nil
}

func (l *NLSLayerGroup) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.infobox
}

func (l *NLSLayerGroup) PhotoOverlay() *PhotoOverlay {
	if l == nil {
		return nil
	}
	return l.photoOverlay
}

func (l *NLSLayerGroup) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.visible = visible
}

func (l *NLSLayerGroup) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.infobox = infobox
}

func (l *NLSLayerGroup) SetPhotoOverlay(photooverlay *PhotoOverlay) {
	if l == nil {
		return
	}
	l.photoOverlay = photooverlay
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
	return l.config
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

	clonedBase := l.layerBase.Clone()

	var clonedChildren *IDList
	if l.children != nil {
		clonedChildren = l.children.Clone()
	}

	return &NLSLayerGroup{
		layerBase: *clonedBase,
		children:  clonedChildren,
		root:      l.root,
	}
}

func (l *NLSLayerGroup) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.isSketch
}

func (l *NLSLayerGroup) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.isSketch = isSketch
}

func (l *NLSLayerGroup) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.sketch != nil
}

func (l *NLSLayerGroup) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.sketch
}

func (l *NLSLayerGroup) SetSketch(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.sketch = sketch
}
