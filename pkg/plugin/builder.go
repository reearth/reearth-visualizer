package plugin

import (
	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
)

type Builder struct {
	p *Plugin
}

func New() *Builder {
	return &Builder{p: &Plugin{}}
}

func (b *Builder) Build() (*Plugin, error) {
	// TODO: check extensions duplication ...etc
	return b.p, nil
}

func (b *Builder) MustBuild() *Plugin {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *Builder) ID(id id.PluginID) *Builder {
	b.p.id = id
	return b
}

func (b *Builder) Name(name i18n.String) *Builder {
	b.p.name = name.Copy()
	return b
}

func (b *Builder) Author(author string) *Builder {
	b.p.author = author
	return b
}

func (b *Builder) Description(description i18n.String) *Builder {
	b.p.description = description.Copy()
	return b
}

func (b *Builder) RepositoryURL(repositoryURL string) *Builder {
	b.p.repositoryURL = repositoryURL
	return b
}

func (b *Builder) Extensions(extensions []*Extension) *Builder {
	if len(extensions) == 0 {
		b.p.extensions = nil
		b.p.extensionOrder = nil
		return b
	}

	b.p.extensions = make(map[id.PluginExtensionID]*Extension, len(extensions))
	b.p.extensionOrder = make([]id.PluginExtensionID, 0, len(extensions))
	for _, e := range extensions {
		b.p.extensions[e.ID()] = e
		b.p.extensionOrder = append(b.p.extensionOrder, e.ID())
	}
	return b
}

func (b *Builder) Schema(schema *id.PropertySchemaID) *Builder {
	if schema == nil {
		b.p.schema = nil
	} else {
		sid := *schema
		b.p.schema = &sid
	}
	return b
}
