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
			WidgetLayout:             ToPluginWidgetLayout(pe.WidgetLayout()),
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

func ToPluginWidgetLayout(wl *plugin.WidgetLayout) *WidgetLayout {
	if wl == nil {
		return nil
	}

	return &WidgetLayout{
		Extendable: &WidgetExtendable{
			Horizontally: wl.HorizontallyExtendable(),
			Vertically:   wl.VerticallyExtendable(),
		},
		Extended:        wl.Extended(),
		Floating:        wl.Floating(),
		DefaultLocation: ToPluginWidgetLocation(wl.DefaultLocation()),
	}
}

func ToPluginWidgetLocation(l *plugin.WidgetLocation) *WidgetLocation {
	if l == nil {
		return nil
	}

	return &WidgetLocation{
		Zone:    ToPluginWidgetZoneType(l.Zone),
		Section: ToPluginWidgetSectionType(l.Section),
		Area:    ToPluginWidgetAreaType(l.Area),
	}
}

func ToPluginWidgetZoneType(t plugin.WidgetZoneType) WidgetZoneType {
	switch t {
	case plugin.WidgetZoneInner:
		return WidgetZoneTypeInner
	case plugin.WidgetZoneOuter:
		return WidgetZoneTypeOuter
	}
	return ""
}

func ToPluginWidgetSectionType(t plugin.WidgetSectionType) WidgetSectionType {
	switch t {
	case plugin.WidgetSectionLeft:
		return WidgetSectionTypeLeft
	case plugin.WidgetSectionCenter:
		return WidgetSectionTypeCenter
	case plugin.WidgetSectionRight:
		return WidgetSectionTypeRight
	}
	return ""
}

func ToPluginWidgetAreaType(t plugin.WidgetAreaType) WidgetAreaType {
	switch t {
	case plugin.WidgetAreaTop:
		return WidgetAreaTypeTop
	case plugin.WidgetAreaMiddle:
		return WidgetAreaTypeMiddle
	case plugin.WidgetAreaBottom:
		return WidgetAreaTypeBottom
	}
	return ""
}
