package scene

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

type Widget struct {
	id        id.WidgetID
	plugin    id.PluginID
	extension id.PluginExtensionID
	property  id.PropertyID
	enabled   bool
}

func NewWidget(wid id.WidgetID, plugin id.PluginID, extension id.PluginExtensionID, property id.PropertyID, enabled bool) (*Widget, error) {
	if !plugin.Validate() || string(extension) == "" || id.ID(property).IsNil() {
		return nil, id.ErrInvalidID
	}

	return &Widget{
		id:        wid,
		plugin:    plugin,
		extension: extension,
		property:  property,
		enabled:   enabled,
	}, nil
}

func MustNewWidget(wid id.WidgetID, plugin id.PluginID, extension id.PluginExtensionID, property id.PropertyID, enabled bool) *Widget {
	w, err := NewWidget(wid, plugin, extension, property, enabled)
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
	return w.enabled
}

func (w *Widget) SetEnabled(enabled bool) {
	w.enabled = enabled
}
