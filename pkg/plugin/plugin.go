package plugin

import (
	"github.com/blang/semver"
	"github.com/reearth/reearth-backend/pkg/i18n"
)

type Plugin struct {
	id             ID
	name           i18n.String
	author         string
	description    i18n.String
	repositoryURL  string
	extensions     map[ExtensionID]*Extension
	extensionOrder []ExtensionID
	schema         *PropertySchemaID
}

func (p *Plugin) ID() ID {
	return p.id
}

func (p *Plugin) Version() semver.Version {
	return p.id.Version()
}

func (p *Plugin) Name() i18n.String {
	return p.name.Copy()
}

func (p *Plugin) Author() string {
	return p.author
}

func (p *Plugin) Description() i18n.String {
	return p.description.Copy()
}

func (p *Plugin) RepositoryURL() string {
	return p.repositoryURL
}

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

func (p *Plugin) Extension(id ExtensionID) *Extension {
	if p == nil {
		return nil
	}

	e, ok := p.extensions[id]
	if ok {
		return e
	}
	return nil
}

func (p *Plugin) Schema() *PropertySchemaID {
	return p.schema
}

func (p *Plugin) PropertySchemas() []PropertySchemaID {
	if p == nil {
		return nil
	}

	ps := make([]PropertySchemaID, 0, len(p.extensions)+1)
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

func (p *Plugin) SetDescription(des i18n.String) {
	p.description = des.Copy()
}
