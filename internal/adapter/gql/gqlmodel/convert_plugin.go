package gqlmodel

import (
	"github.com/reearth/reearth-backend/pkg/plugin"
)

func ToPlugin(p *plugin.Plugin) *Plugin {
	if p == nil {
		return nil
	}

	pid := p.ID()
	pluginExtensions := p.Extensions()
	extensions := make([]*PluginExtension, 0, len(pluginExtensions))
	for _, pe := range pluginExtensions {
		extensions = append(extensions, &PluginExtension{
			ExtensionID:              pe.ID(),
			PluginID:                 pid,
			Type:                     ToPluginExtensionType(pe.Type()),
			Visualizer:               ToVisualizer(pe.Visualizer()),
			Name:                     pe.Name().String(),
			Description:              pe.Description().String(),
			Icon:                     pe.Icon(),
			PropertySchemaID:         pe.Schema(),
			AllTranslatedDescription: pe.Description(),
			AllTranslatedName:        pe.Name(),
		})
	}

	return &Plugin{
		ID:                       pid,
		SceneID:                  pid.Scene().IDRef(),
		Name:                     p.Name().String(),
		Description:              p.Description().String(),
		AllTranslatedDescription: p.Description(),
		AllTranslatedName:        p.Name(),
		Author:                   p.Author(),
		RepositoryURL:            p.RepositoryURL(),
		Version:                  p.Version().String(),
		PropertySchemaID:         p.Schema(),
		Extensions:               extensions,
	}
}

func ToPluginExtensionType(t plugin.ExtensionType) PluginExtensionType {
	switch t {
	case plugin.ExtensionTypePrimitive:
		return PluginExtensionTypePrimitive
	case plugin.ExtensionTypeWidget:
		return PluginExtensionTypeWidget
	case plugin.ExtensionTypeBlock:
		return PluginExtensionTypeBlock
	case plugin.ExtensionTypeVisualizer:
		return PluginExtensionTypeVisualizer
	case plugin.ExtensionTypeInfobox:
		return PluginExtensionTypeInfobox
	}
	return PluginExtensionType("")
}

func ToPluginMetadata(t *plugin.Metadata) (*PluginMetadata, error) {
	if t == nil {
		return nil, nil
	}

	return &PluginMetadata{
		Name:         t.Name,
		Description:  t.Description,
		ThumbnailURL: t.ThumbnailUrl,
		Author:       t.Author,
		CreatedAt:    t.CreatedAt,
	}, nil
}
