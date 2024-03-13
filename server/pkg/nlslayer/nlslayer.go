package nlslayer

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
	infobox   *Infobox
	config    *Config
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
		layerType: l.layerType,
		scene:     l.scene,
		title:     l.title,
		visible:   l.visible,
		config:    clonedConfig,
	}

	if l.infobox != nil {
		cloned.infobox = l.infobox.Clone()
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
		id:        NewID(),
		layerType: l.layerType,
		scene:     l.scene,
		title:     l.title,
		visible:   l.visible,
		config:    duplicatedConfig,
	}

	if l.infobox != nil {
		duplicated.infobox = l.infobox.Clone()
	}

	return &NLSLayerSimple{layerBase: *duplicated}
}
