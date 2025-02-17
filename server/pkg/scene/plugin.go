package scene

import "github.com/reearth/reearth/server/pkg/id"

type Plugin struct {
	plugin   id.PluginID
	property *PropertyID
}

func NewPlugin(plugin id.PluginID, property *PropertyID) *Plugin {
	return &Plugin{
		plugin:   plugin,
		property: property.CloneRef(),
	}
}

func (s *Plugin) Plugin() id.PluginID {
	if s == nil {
		return id.PluginID{}
	}
	return s.plugin
}

func (s *Plugin) PluginRef() *id.PluginID {
	if s == nil {
		return nil
	}
	return s.plugin.Ref()
}

func (s *Plugin) Property() *PropertyID {
	if s == nil {
		return nil
	}
	return s.property.CloneRef()
}

func (s *Plugin) Clone() *Plugin {
	if s == nil {
		return nil
	}
	return &Plugin{
		plugin:   s.plugin.Clone(),
		property: s.property.CloneRef(),
	}
}
