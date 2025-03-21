package nlslayer

import "github.com/reearth/reearth/server/pkg/id"

type NLSLayer interface {
	Cloner
	ID() id.NLSLayerID
	Index() *int
	LayerType() LayerType
	Scene() id.SceneID
	Config() *Config
	Title() string
	IsVisible() bool
	SetVisible(bool)
	HasInfobox() bool
	Infobox() *Infobox
	SetInfobox(*Infobox)
	PhotoOverlay() *PhotoOverlay
	SetPhotoOverlay(*PhotoOverlay)
	SetIndex(*int)
	Rename(string)
	UpdateConfig(*Config)
	Duplicate() NLSLayer
	IsSketch() bool
	SetIsSketch(bool)
	HasSketch() bool
	Sketch() *SketchInfo
	SetSketch(*SketchInfo)
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
	id           id.NLSLayerID
	index        *int
	layerType    LayerType
	scene        id.SceneID
	title        string
	visible      bool
	infobox      *Infobox
	photoOverlay *PhotoOverlay
	config       *Config
	isSketch     bool
	sketch       *SketchInfo
}

func (l *layerBase) ID() id.NLSLayerID {
	return l.id
}

func (l *layerBase) Index() *int {
	if l == nil {
		return nil
	}
	return l.index
}

func (l *layerBase) IDRef() *id.NLSLayerID {
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

func (l *layerBase) Scene() id.SceneID {
	return l.scene
}

func (l *layerBase) Config() *Config {
	return l.config
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

func (l *layerBase) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.infobox
}

func (l *layerBase) PhotoOverlay() *PhotoOverlay {
	if l == nil {
		return nil
	}
	return l.photoOverlay
}

func (l *layerBase) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.visible = visible
}

func (l *layerBase) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.infobox = infobox
}

func (l *layerBase) SetPhotoOverlay(photoOverlay *PhotoOverlay) {
	if l == nil {
		return
	}
	l.photoOverlay = photoOverlay
}

func (l *layerBase) SetIndex(index *int) {
	if l == nil {
		return
	}
	l.index = index
}

func (l *layerBase) Rename(name string) {
	if l == nil {
		return
	}
	l.title = name
}

func (l *layerBase) UpdateConfig(newConfig *Config) {
	if l == nil || newConfig == nil {
		return
	}

	if l.config == nil {
		l.config = newConfig
		return
	}

	for key, value := range *newConfig {
		(*l.config)[key] = value
	}
}

func (l *layerBase) Clone() *layerBase {
	if l == nil {
		return nil
	}
	var clonedConfig *Config
	if l.config != nil {
		clonedConfigItem := l.config.Clone()
		clonedConfig = &clonedConfigItem
	}

	cloned := &layerBase{
		id:        l.id,
		index:     l.index,
		layerType: l.layerType,
		scene:     l.scene,
		title:     l.title,
		visible:   l.visible,
		config:    clonedConfig,
		isSketch:  l.isSketch,
	}

	if l.infobox != nil {
		cloned.infobox = l.infobox.Clone()
	}

	if l.sketch != nil {
		cloned.sketch = l.sketch.Clone()
	}

	return cloned
}

func (l *layerBase) Duplicate() NLSLayer {
	if l == nil {
		return nil
	}
	var duplicatedConfig *Config
	if l.config != nil {
		duplicatedConfigItem := l.config.Clone()
		duplicatedConfig = &duplicatedConfigItem
	}

	duplicated := &layerBase{
		id:        id.NewNLSLayerID(),
		index:     l.index,
		layerType: l.layerType,
		scene:     l.scene,
		title:     l.title,
		visible:   l.visible,
		config:    duplicatedConfig,
		isSketch:  l.isSketch,
	}

	if l.infobox != nil {
		duplicated.infobox = l.infobox.Clone()
	}

	if l.sketch != nil {
		duplicated.sketch = l.sketch.Clone()
	}

	return &NLSLayerSimple{layerBase: *duplicated}
}

func (l *layerBase) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.isSketch
}

func (l *layerBase) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.isSketch = isSketch
}

func (l *layerBase) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.sketch != nil
}

func (l *layerBase) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.sketch
}

func (l *layerBase) SetSketchInfo(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.sketch = sketch
}
