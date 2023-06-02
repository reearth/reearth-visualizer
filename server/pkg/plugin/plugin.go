package plugin

import (
	"github.com/blang/semver"
	"github.com/reearth/reearth/server/pkg/i18n"
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
	if p == nil {
		return ID{}
	}
	return p.id
}

func (p *Plugin) Version() semver.Version {
	if p == nil {
		return semver.Version{}
	}
	return p.id.Version()
}

func (p *Plugin) Scene() *SceneID {
	return p.ID().Scene()
}

func (p *Plugin) Name() i18n.String {
	if p == nil {
		return nil
	}
	return p.name.Clone()
}

func (p *Plugin) Author() string {
	if p == nil {
		return ""
	}
	return p.author
}

func (p *Plugin) Description() i18n.String {
	if p == nil {
		return nil
	}
	return p.description.Clone()
}

func (p *Plugin) RepositoryURL() string {
	if p == nil {
		return ""
	}
	return p.repositoryURL
}

func (p *Plugin) Extensions() []*Extension {
	if p == nil || len(p.extensions) == 0 {
		return nil
	}

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
	if p == nil {
		return nil
	}
	return p.schema
}

func (p *Plugin) PropertySchemas() PropertySchemaIDList {
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

func (p *Plugin) Clone() *Plugin {
	if p == nil {
		return nil
	}

	var extensions map[ExtensionID]*Extension
	if p.extensions != nil {
		extensions = make(map[ExtensionID]*Extension, len(p.extensions))
		for _, e := range p.extensions {
			extensions[e.ID()] = e.Clone()
		}
	}

	var extensionOrder []ExtensionID
	if p.extensionOrder != nil {
		extensionOrder = append([]ExtensionID{}, p.extensionOrder...)
	}

	return &Plugin{
		id:             p.id.Clone(),
		name:           p.name.Clone(),
		author:         p.author,
		description:    p.description.Clone(),
		repositoryURL:  p.repositoryURL,
		extensions:     extensions,
		extensionOrder: extensionOrder,
		schema:         p.schema.CopyRef(),
	}
}
