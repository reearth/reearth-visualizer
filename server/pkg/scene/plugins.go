package scene

type Plugins struct {
	plugins []*Plugin
}

func NewPlugins(plugins []*Plugin) *Plugins {
	if plugins == nil {
		return &Plugins{plugins: []*Plugin{}}
	}
	p2 := make([]*Plugin, 0, len(plugins))
	for _, p1 := range plugins {
		if p1 == nil {
			continue
		}
		duplicated := false
		for _, p3 := range p2 {
			if p1.plugin.Equal(p3.plugin) {
				duplicated = true
				break
			}
		}
		if !duplicated {
			p2 = append(p2, p1)
		}
	}
	return &Plugins{plugins: p2}
}

func (p *Plugins) Plugins() []*Plugin {
	return append([]*Plugin{}, p.plugins...)
}

func (p *Plugins) Property(id PluginID) *PropertyID {
	for _, p := range p.plugins {
		if p.plugin.Equal(id) {
			return p.property.CloneRef()
		}
	}
	return nil
}

func (p *Plugins) Has(id PluginID) bool {
	for _, p2 := range p.plugins {
		if p2.plugin.Equal(id) {
			return true
		}
	}
	return false
}

func (p *Plugins) HasPlugin(id PluginID) bool {
	for _, p2 := range p.plugins {
		if p2.plugin.Equal(id) {
			return true
		}
	}
	return false
}

func (p *Plugins) HasPluginByName(name string) bool {
	for _, p2 := range p.plugins {
		if p2.plugin.Name() == name {
			return true
		}
	}
	return false
}

func (p *Plugins) Add(sp *Plugin) bool {
	if sp == nil || p.HasPluginByName(sp.plugin.Name()) || sp.plugin.Equal(OfficialPluginID) {
		return false
	}
	p.plugins = append(p.plugins, sp)
	return true
}

func (p *Plugins) Remove(pid PluginID) {
	if pid.Equal(OfficialPluginID) {
		return
	}
	for i, p2 := range p.plugins {
		if p2.plugin.Equal(pid) {
			p.plugins = append(p.plugins[:i], p.plugins[i+1:]...)
			return
		}
	}
}

func (p *Plugins) Upgrade(from, to PluginID, pr *PropertyID, deleteProperty bool) {
	if p == nil || from.IsNil() || to.IsNil() || from.Equal(to) || from.Equal(OfficialPluginID) {
		return
	}

	for i, p2 := range p.plugins {
		if !p2.plugin.Equal(from) {
			continue
		}
		var newpr *PropertyID
		if !deleteProperty {
			newpr = pr.CloneRef()
			if newpr == nil {
				newpr = p2.property.CloneRef()
			}
		}
		p.plugins[i] = &Plugin{plugin: to, property: newpr}
		return
	}
}

func (p *Plugins) Properties() []PropertyID {
	if p == nil {
		return nil
	}
	res := make([]PropertyID, 0, len(p.plugins))
	for _, pp := range p.plugins {
		if pp.property != nil {
			res = append(res, *pp.property)
		}
	}
	return res
}

func (p *Plugins) Plugin(pluginID PluginID) *Plugin {
	for _, pp := range p.plugins {
		if pp.plugin.Equal(pluginID) {
			return pp
		}
	}
	return nil
}

func (p *Plugins) PluginByName(name string) *Plugin {
	for _, pp := range p.plugins {
		if pp.plugin.Name() == name {
			return pp
		}
	}
	return nil
}
