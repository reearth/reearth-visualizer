package gqlmodel

import (
	"encoding/json"

	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func ToPlugin(p *plugin.Plugin) *Plugin {
	if p == nil {
		return nil
	}

	pid := IDFromPluginID(p.ID())
	return &Plugin{
		ID:                       pid,
		SceneID:                  IDFromRef(p.ID().Scene()),
		Name:                     p.Name().String(),
		Description:              p.Description().String(),
		AllTranslatedDescription: p.Description(),
		AllTranslatedName:        p.Name(),
		Author:                   p.Author(),
		RepositoryURL:            p.RepositoryURL(),
		Version:                  p.Version().String(),
		PropertySchemaID:         IDFromPropertySchemaIDRef(p.Schema()),
		Extensions: util.Map(p.Extensions(), func(pe *plugin.Extension) *PluginExtension {
			return &PluginExtension{
				ExtensionID:              ID(pe.ID()),
				PluginID:                 pid,
				Type:                     ToPluginExtensionType(pe.Type()),
				Visualizer:               ToVisualizerRef(pe.Visualizer()),
				Name:                     pe.Name().String(),
				Description:              pe.Description().String(),
				Icon:                     pe.Icon(),
				SingleOnly:               BoolToRef(pe.SingleOnly()),
				WidgetLayout:             ToPluginWidgetLayout(pe.WidgetLayout()),
				PropertySchemaID:         IDFromPropertySchemaID(pe.Schema()),
				AllTranslatedDescription: pe.Description(),
				AllTranslatedName:        pe.Name(),
			}
		}),
	}
}

func ToPlugins(pl []*plugin.Plugin) []*Plugin {
	return lo.Map(pl, func(s *plugin.Plugin, _ int) *Plugin {
		return ToPlugin(s)
	})
}

func ToPluginsFromJSON(data []interface{}) []*Plugin {
	var plgs []*Plugin
	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil
	}
	if err := json.Unmarshal(bytes, &plgs); err != nil {
		return nil
	}
	return plgs
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
	case plugin.ExtensionTypeInfoboxBlock:
		return PluginExtensionTypeInfoboxBlock
	case plugin.ExtensionTypeCluster:
		return PluginExtensionTypeCluster
	case plugin.ExtensionTypeStory:
		return PluginExtensionTypeStory
	case plugin.ExtensionTypeStoryPage:
		return PluginExtensionTypeStoryPage
	case plugin.ExtensionTypeStoryBlock:
		return PluginExtensionTypeStoryBlock
	}
	return PluginExtensionType("")
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
