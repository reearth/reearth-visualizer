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

type layerBase struct {
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

func (l *layerBase) ID() ID {
	return l.IDField
}

func (l *layerBase) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.IDField.Ref()
}

func (l *layerBase) LayerType() LayerType {
	if l == nil {
		return ""
	}
	return l.LayerTypeField
}

func (l *layerBase) Scene() SceneID {
	return l.SceneField
}

func (l *layerBase) Config() *Config {
	return l.ConfigField
}

func (l *layerBase) Title() string {
	if l == nil {
		return ""
	}
	return l.TitleField
}

func (l *layerBase) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.VisibleField
}

func (l *layerBase) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.InfoboxField != nil
}

func (l *layerBase) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.InfoboxField
}

func (l *layerBase) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.VisibleField = visible
}

func (l *layerBase) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.InfoboxField = infobox
}

func (l *layerBase) Rename(name string) {
	if l == nil {
		return
	}
	l.TitleField = name
}

func (l *layerBase) UpdateConfig(newConfig *Config) {
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

func (l *layerBase) Clone() *layerBase {
	if l == nil {
		return nil
	}
	var clonedConfig *Config
	if l.ConfigField != nil {
		clonedConfigItem := l.ConfigField.Clone()
		clonedConfig = &clonedConfigItem
	}

	cloned := &layerBase{
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

func (l *layerBase) Duplicate() NLSLayer {
	if l == nil {
		return nil
	}
	var duplicatedConfig *Config
	if l.ConfigField != nil {
		duplicatedConfigItem := l.ConfigField.Clone()
		duplicatedConfig = &duplicatedConfigItem
	}

	duplicated := &layerBase{
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

	return &NLSLayerSimple{layerBase: *duplicated}
}

func (l *layerBase) IsSketch() bool {
	if l == nil {
		return false
	}
	return l.IsSketchField
}

func (l *layerBase) SetIsSketch(isSketch bool) {
	if l == nil {
		return
	}
	l.IsSketchField = isSketch
}

func (l *layerBase) HasSketch() bool {
	if l == nil {
		return false
	}
	return l.SketchField != nil
}

func (l *layerBase) Sketch() *SketchInfo {
	if l == nil {
		return nil
	}
	return l.SketchField
}

func (l *layerBase) SetSketchInfo(sketch *SketchInfo) {
	if l == nil {
		return
	}
	l.SketchField = sketch
}

func NLSLayerCacheKey(id ID) string {
	return fmt.Sprintf("NLSLayer:%s", id)
}
