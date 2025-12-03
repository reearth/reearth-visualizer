package scene

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/idx"
)

type Widget struct {
	id        id.WidgetID
	plugin    id.PluginID
	extension id.PluginExtensionID
	property  id.PropertyID
	enabled   bool
	extended  bool
}

func NewWidget(wid id.WidgetID, plugin id.PluginID, extension id.PluginExtensionID, property id.PropertyID, enabled bool, extended bool) (*Widget, error) {
	if !plugin.Validate() || string(extension) == "" || property.IsNil() {
		return nil, idx.ErrInvalidID
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

func MustWidget(wid id.WidgetID, plugin id.PluginID, extension id.PluginExtensionID, property id.PropertyID, enabled bool, extended bool) *Widget {
	w, err := NewWidget(wid, plugin, extension, property, enabled, extended)
	if err != nil {
		panic(err)
	}
	return w
}

func (w *Widget) ID() id.WidgetID {
	return w.id
}

func (w *Widget) Plugin() id.PluginID {
	return w.plugin
}

func (w *Widget) Extension() id.PluginExtensionID {
	return w.extension
}

func (w *Widget) Property() id.PropertyID {
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

func (w *Widget) SetPlugin(pid id.PluginID) {
	if w == nil || pid.IsNil() {
		return
	}
	w.plugin = pid.Clone()
}
