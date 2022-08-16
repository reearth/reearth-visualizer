package scene

type Widget struct {
	id        WidgetID
	plugin    PluginID
	extension PluginExtensionID
	property  PropertyID
	enabled   bool
	extended  bool
}

func NewWidget(wid WidgetID, plugin PluginID, extension PluginExtensionID, property PropertyID, enabled, extended bool) (*Widget, error) {
	if !plugin.Validate() || string(extension) == "" || property.IsNil() {
		return nil, ErrInvalidID
	}

	return &Widget{
		id:        wid,
		plugin:    plugin,
		extension: extension,
		property:  property,
		enabled:   enabled,
		extended:  extended,
	}, nil
}

func MustWidget(wid WidgetID, plugin PluginID, extension PluginExtensionID, property PropertyID, enabled bool, extended bool) *Widget {
	w, err := NewWidget(wid, plugin, extension, property, enabled, extended)
	if err != nil {
		panic(err)
	}
	return w
}

func (w *Widget) ID() WidgetID {
	return w.id
}

func (w *Widget) Plugin() PluginID {
	return w.plugin
}

func (w *Widget) Extension() PluginExtensionID {
	return w.extension
}

func (w *Widget) Property() PropertyID {
	return w.property
}

func (w *Widget) Enabled() bool {
	if w == nil {
		return false
	}
	return w.enabled
}

func (w *Widget) Extended() bool {
	if w == nil {
		return false
	}
	return w.extended
}

func (w *Widget) SetEnabled(enabled bool) {
	if w == nil {
		return
	}
	w.enabled = enabled
}

func (w *Widget) SetExtended(extended bool) {
	if w == nil {
		return
	}
	w.extended = extended
}

func (w *Widget) Clone() *Widget {
	if w == nil {
		return nil
	}
	return &Widget{
		id:        w.id,
		plugin:    w.plugin.Clone(),
		extension: w.extension,
		property:  w.property,
		enabled:   w.enabled,
		extended:  w.extended,
	}
}

func (w *Widget) SetPlugin(pid PluginID) {
	if w == nil || pid.IsNil() {
		return
	}
	w.plugin = pid.Clone()
}
