package scene

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// Plugin _
type Plugin struct {
	plugin   id.PluginID
	property *id.PropertyID
}

// NewPlugin _
func NewPlugin(plugin id.PluginID, property *id.PropertyID) *Plugin {
	if property != nil {
		property2 := *property
		property = &property2
	}
	return &Plugin{
		plugin:   plugin,
		property: property,
	}
}

// Plugin _
func (s Plugin) Plugin() id.PluginID {
	return s.plugin
}

// Property _
func (s Plugin) Property() *id.PropertyID {
	property := s.property
	if property != nil {
		property2 := *property
		property = &property2
	}
	return property
}
