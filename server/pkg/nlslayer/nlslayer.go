package nlslayer

import "fmt"

type NLSLayer interface {
	Cloner
	ID() ID
	LayerType() LayerType
	Scene() SceneID
	Config() *Config
	Title() string
	IsVisible() bool
	SetVisible(bool)
	HasInfobox() bool
	Infobox() *Infobox
	SetInfobox(*Infobox)
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

type LayerBase struct {
	IDField        ID          `msgpack:"IDField"`
	LayerTypeField LayerType   `msgpack:"LayerTypeField"`
	SceneField     SceneID     `msgpack:"SceneField"`
	TitleField     string      `msgpack:"TitleField"`
	VisibleField   bool        `msgpack:"VisibleField"`
	InfoboxField   *Infobox    `msgpack:"InfoboxField"`
	ConfigField    *Config     `msgpack:"ConfigField"`
	IsSketchField  bool        `msgpack:"IsSketchField"`
	SketchField    *SketchInfo `msgpack:"SketchField"`
}

func (l *LayerBase) ID() ID {
	return l.IDField
}

func (l *LayerBase) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.IDField.Ref()
}

func (l *LayerBase) LayerType() LayerType {
	if l == nil {
		return ""
	}
	return l.LayerTypeField
}

func (l *LayerBase) Scene() SceneID {
	return l.SceneField
}

func (l *LayerBase) Config() *Config {
	return l.ConfigField
}

func (l *LayerBase) Title() string {
	if l == nil {
		return ""
	}
	return l.TitleField
}

func (l *LayerBase) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.VisibleField
}

func (l *LayerBase) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.InfoboxField != nil
}

func (l *LayerBase) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.InfoboxField
}

func (l *LayerBase) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.VisibleField = visible
}

func (l *LayerBase) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.InfoboxField = infobox
}

func (l *LayerBase) Rename(name string) {
	if l == nil {
		return
	}
	l.TitleField = name
}

func (l *LayerBase) UpdateConfig(newConfig *Config) {
	if l == nil || newConfig == nil {
		return
	}

	if l.ConfigField == nil {
		l.ConfigField = newConfig
		return
	}

	for key, value := range *newConfig {
		(*l.ConfigField)[key] = value
	}
}

func (l *LayerBase) Clone() Cloner {
	if l == nil {
		return nil
	}
	var clonedConfig *Config
	if l.ConfigField != nil {
		clonedConfigItem := l.ConfigField.Clone()
		clonedConfig = &clonedConfigItem
	}

	cloned := &LayerBase{
		IDField:        l.IDField,
		LayerTypeField: l.LayerTypeField,
		SceneField:     l.SceneField,
		TitleField:     l.TitleField,
		VisibleField:   l.VisibleField,
		ConfigField:    clonedConfig,
		IsSketchField:  l.IsSketchField,
	}

	if l.InfoboxField != nil {
		cloned.InfoboxField = l.InfoboxField.Clone()
	}

	if l.SketchField != nil {
		cloned.SketchField = l.SketchField.Clone()
	}

	return cloned
}

func (l *LayerBase) Duplicate() NLSLayer {
	if l == nil {
		return nil
	}
	var duplicatedConfig *Config
	if l.ConfigField != nil {
		duplicatedConfigItem := l.ConfigField.Clone()
		duplicatedConfig = &duplicatedConfigItem
	}

	duplicated := &LayerBase{
		IDField:        NewID(),
		LayerTypeField: l.LayerTypeField,
		SceneField:     l.SceneField,
		TitleField:     l.TitleField,
		VisibleField:   l.VisibleField,
		ConfigField:    duplicatedConfig,
		IsSketchField:  l.IsSketchField,
	}

	if l.InfoboxField != nil {
		duplicated.InfoboxField = l.InfoboxField.Clone()
	}

	if l.SketchField != nil {
		duplicated.SketchField = l.SketchField.Clone()
	}

	return &NLSLayerSimple{LayerBase: *duplicated}
}

func (l *LayerBase) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.IsSketchField
}

func (l *LayerBase) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.IsSketchField = isSketch
}

func (l *LayerBase) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.SketchField != nil
}

func (l *LayerBase) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.SketchField
}

func (l *LayerBase) SetSketch(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.SketchField = sketch
}

func (l *LayerBase) SetSketchInfo(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.SketchField = sketch
}

func NLSLayerCacheKey(id ID) string {
	return fmt.Sprintf("NLSLayer:%s", id)
}
