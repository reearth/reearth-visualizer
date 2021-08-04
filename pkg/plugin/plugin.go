package plugin

import (
	"github.com/blang/semver"
	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
)

// Plugin _
type Plugin struct {
	id             id.PluginID
	name           i18n.String
	author         string
	description    i18n.String
	repositoryURL  string
	extensions     map[id.PluginExtensionID]*Extension
	extensionOrder []id.PluginExtensionID
	schema         *id.PropertySchemaID
}

// ID _
func (p *Plugin) ID() id.PluginID {
	return p.id
}

// Version _
func (p *Plugin) Version() semver.Version {
	return p.id.Version()
}

// Name _
func (p *Plugin) Name() i18n.String {
	return p.name.Copy()
}

// Author _
func (p *Plugin) Author() string {
	return p.author
}

// Description _
func (p *Plugin) Description() i18n.String {
	return p.description.Copy()
}

// RepositoryURL _
func (p *Plugin) RepositoryURL() string {
	return p.repositoryURL
}

// Extensions _
func (p *Plugin) Extensions() []*Extension {
	if p.extensionOrder == nil {
		return []*Extension{}
	}
	list := make([]*Extension, 0, len(p.extensions))
	for _, id := range p.extensionOrder {
		list = append(list, p.extensions[id])
	}
	return list
}

// Extension _
func (p *Plugin) Extension(id id.PluginExtensionID) *Extension {
	e, ok := p.extensions[id]
	if ok {
		return e
	}
	return nil
}

// Schema _
func (p *Plugin) Schema() *id.PropertySchemaID {
	return p.schema
}

func (p *Plugin) PropertySchemas() []id.PropertySchemaID {
	if p == nil {
		return nil
	}

	ps := make([]id.PropertySchemaID, 0, len(p.extensions)+1)
	if p.schema != nil {
		ps = append(ps, *p.schema)
	}
	for _, e := range p.extensionOrder {
		ps = append(ps, p.extensions[e].Schema())
	}
	return ps
}

func (p *Plugin) Rename(name i18n.String) {
	p.name = name.Copy()
}

// SetDescription _
func (p *Plugin) SetDescription(des i18n.String) {
	p.description = des.Copy()
}
