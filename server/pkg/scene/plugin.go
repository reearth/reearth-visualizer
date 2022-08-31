package scene

type Plugin struct {
	plugin   PluginID
	property *PropertyID
}

func NewPlugin(plugin PluginID, property *PropertyID) *Plugin {
	return &Plugin{
		plugin:   plugin,
		property: property.CloneRef(),
	}
}

func (s *Plugin) Plugin() PluginID {
	if s == nil {
		return PluginID{}
	}
	return s.plugin
}

func (s *Plugin) PluginRef() *PluginID {
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
