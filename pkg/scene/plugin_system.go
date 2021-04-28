package scene

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// PluginSystem _
type PluginSystem struct {
	plugins []*Plugin
}

// NewPluginSystem _
func NewPluginSystem(p []*Plugin) *PluginSystem {
	if p == nil {
		return &PluginSystem{plugins: []*Plugin{}}
	}
	p2 := make([]*Plugin, 0, len(p))
	for _, p1 := range p {
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
			p3 := *p1
			p2 = append(p2, &p3)
		}
	}
	return &PluginSystem{plugins: p2}
}

// Plugins _
func (p *PluginSystem) Plugins() []*Plugin {
	return append([]*Plugin{}, p.plugins...)
}

// Property _
func (p *PluginSystem) Property(id id.PluginID) *id.PropertyID {
	for _, p := range p.plugins {
		if p.plugin.Equal(id) {
			p2 := *p.property
			return &p2
		}
	}
	return nil
}

// Has _
func (p *PluginSystem) Has(id id.PluginID) bool {
	for _, p2 := range p.plugins {
		if p2.plugin.Equal(id) {
			return true
		}
	}
	return false
}

// HasPlugin _
func (p *PluginSystem) HasPlugin(id id.PluginID) bool {
	name := id.Name()
	for _, p2 := range p.plugins {
		if p2.plugin.Name() == name {
			return true
		}
	}
	return false
}

// Add _
func (p *PluginSystem) Add(sp *Plugin) {
	if sp == nil || p.Has(sp.plugin) || sp.plugin.Equal(id.OfficialPluginID) {
		return
	}
	sp2 := *sp
	p.plugins = append(p.plugins, &sp2)
}

// Remove _
func (p *PluginSystem) Remove(pid id.PluginID) {
	if pid.Equal(id.OfficialPluginID) {
		return
	}
	for i, p2 := range p.plugins {
		if p2.plugin.Equal(pid) {
			p.plugins = append(p.plugins[:i], p.plugins[i+1:]...)
			return
		}
	}
}

// Upgrade _
func (p *PluginSystem) Upgrade(pid, newID id.PluginID) {
	for i, p2 := range p.plugins {
		if p2.plugin.Equal(id.OfficialPluginID) {
			continue
		}
		if p2.plugin.Equal(pid) {
			p.plugins[i] = &Plugin{plugin: newID, property: p2.property}
			return
		}
	}
}

// Properties _
func (p *PluginSystem) Properties() []id.PropertyID {
	if p == nil {
		return nil
	}
	res := make([]id.PropertyID, 0, len(p.plugins))
	for _, pp := range p.plugins {
		if pp.property != nil {
			res = append(res, *pp.property)
		}
	}
	return res
}

func (p *PluginSystem) Plugin(pluginID id.PluginID) *Plugin {
	for _, pp := range p.plugins {
		if pp.plugin == pluginID {
			return pp
		}
	}
	return nil
}
