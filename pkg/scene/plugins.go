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
			return p.property.CopyRef()
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
	name := id.Name()
	for _, p2 := range p.plugins {
		if p2.plugin.Name() == name {
			return true
		}
	}
	return false
}

func (p *Plugins) Add(sp *Plugin) {
	if sp == nil || p.Has(sp.plugin) || sp.plugin.Equal(OfficialPluginID) {
		return
	}
	p.plugins = append(p.plugins, sp)
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

func (p *Plugins) Upgrade(pid, newID PluginID) {
	for i, p2 := range p.plugins {
		if p2.plugin.Equal(OfficialPluginID) {
			continue
		}
		if p2.plugin.Equal(pid) {
			p.plugins[i] = &Plugin{plugin: newID, property: p2.property}
			return
		}
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
