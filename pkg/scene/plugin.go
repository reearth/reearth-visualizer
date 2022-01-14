package scene

type Plugin struct {
	plugin   PluginID
	property *PropertyID
}

func NewPlugin(plugin PluginID, property *PropertyID) *Plugin {
	if property != nil {
		property2 := *property
		property = &property2
	}
	return &Plugin{
		plugin:   plugin,
		property: property,
	}
}

func (s Plugin) Plugin() PluginID {
	return s.plugin
}

func (s Plugin) Property() *PropertyID {
	property := s.property
	if property != nil {
		property2 := *property
		property = &property2
	}
	return property
}
