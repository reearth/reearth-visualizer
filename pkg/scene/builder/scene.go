package builder

import (
	"context"
	"time"

	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type sceneJSON struct {
	SchemaVersion     int                     `json:"schemaVersion"`
	ID                string                  `json:"id"`
	PublishedAt       time.Time               `json:"publishedAt"`
	Property          propertyJSON            `json:"property"`
	Plugins           map[string]propertyJSON `json:"plugins"`
	Layers            []*layerJSON            `json:"layers"`
	Widgets           []*widgetJSON           `json:"widgets"`
	WidgetAlignSystem *widgetAlignSystemJSON  `json:"widgetAlignSystem"`
	Clusters          []*clusterJSON          `json:"clusters"`
}

func (b *Builder) scene(ctx context.Context, s *scene.Scene, publishedAt time.Time, l []*layerJSON, p []*property.Property) *sceneJSON {
	return &sceneJSON{
		SchemaVersion:     version,
		ID:                s.ID().String(),
		PublishedAt:       publishedAt,
		Property:          b.property(ctx, findProperty(p, s.Property())),
		Plugins:           b.plugins(ctx, s, p),
		Widgets:           b.widgets(ctx, s, p),
		Clusters:          b.clusters(ctx, s, p),
		Layers:            l,
		WidgetAlignSystem: buildWidgetAlignSystem(s.WidgetAlignSystem()),
	}
}

func (b *Builder) plugins(ctx context.Context, s *scene.Scene, p []*property.Property) map[string]propertyJSON {
	scenePlugins := s.Plugins().Plugins()
	res := map[string]propertyJSON{}
	for _, sp := range scenePlugins {
		if sp == nil {
			continue
		}
		if pp := sp.Property(); pp != nil {
			res[sp.Plugin().String()] = b.property(ctx, findProperty(p, *pp))
		}
	}
	return res
}

func (b *Builder) widgets(ctx context.Context, s *scene.Scene, p []*property.Property) []*widgetJSON {
	sceneWidgets := s.Widgets().Widgets()
	res := make([]*widgetJSON, 0, len(sceneWidgets))
	for _, w := range sceneWidgets {
		if !w.Enabled() {
			continue
		}

		res = append(res, &widgetJSON{
			ID:          w.ID().String(),
			PluginID:    w.Plugin().String(),
			ExtensionID: string(w.Extension()),
			Property:    b.property(ctx, findProperty(p, w.Property())),
			Extended:    w.Extended(),
		})
	}
	return res
}

func (b *Builder) clusters(ctx context.Context, s *scene.Scene, p []*property.Property) []*clusterJSON {
	sceneClusters := s.Clusters().Clusters()
	res := make([]*clusterJSON, 0, len(sceneClusters))
	for _, c := range sceneClusters {
		res = append(res, &clusterJSON{
			ID:       c.ID().String(),
			Name:     c.Name(),
			Property: b.property(ctx, findProperty(p, c.Property())),
		})
	}
	return res
}

func (b *Builder) property(ctx context.Context, p *property.Property) propertyJSON {
	return property.SealProperty(ctx, p).Interface()
}

func findProperty(pp []*property.Property, i property.ID) *property.Property {
	for _, p := range pp {
		if p.ID() == i {
			return p
		}
	}
	return nil
}

func toString(wids []scene.WidgetID) []string {
	if wids == nil {
		return nil
	}
	docids := make([]string, 0, len(wids))
	for _, wid := range wids {
		docids = append(docids, wid.String())
	}
	return docids
}

func buildWidgetAlignSystem(s *scene.WidgetAlignSystem) *widgetAlignSystemJSON {
	if s == nil {
		return nil
	}
	was := widgetAlignSystemJSON{
		Inner: buildWidgetZone(s.Zone(scene.WidgetZoneInner)),
		Outer: buildWidgetZone(s.Zone(scene.WidgetZoneOuter)),
	}
	if was.Inner == nil && was.Outer == nil {
		return nil
	}
	return &was
}

func buildWidgetZone(z *scene.WidgetZone) *widgetZoneJSON {
	if z == nil {
		return nil
	}
	zj := widgetZoneJSON{
		Left:   buildWidgetSection(z.Section(scene.WidgetSectionLeft)),
		Center: buildWidgetSection(z.Section(scene.WidgetSectionCenter)),
		Right:  buildWidgetSection(z.Section(scene.WidgetSectionRight)),
	}
	if zj.Left == nil && zj.Center == nil && zj.Right == nil {
		return nil
	}
	return &zj
}

func buildWidgetSection(s *scene.WidgetSection) *widgetSectionJSON {
	if s == nil {
		return nil
	}
	sj := widgetSectionJSON{
		Middle: buildWidgetArea(s.Area(scene.WidgetAreaMiddle)),
		Top:    buildWidgetArea(s.Area(scene.WidgetAreaTop)),
		Bottom: buildWidgetArea(s.Area(scene.WidgetAreaBottom)),
	}
	if sj.Top == nil && sj.Middle == nil && sj.Bottom == nil {
		return nil
	}
	return &sj
}

func buildWidgetArea(a *scene.WidgetArea) *widgetAreaJSON {
	if a == nil || len(a.WidgetIDs()) == 0 {
		return nil
	}
	return &widgetAreaJSON{
		WidgetIDs: toString(a.WidgetIDs()),
		Align:     string(a.Alignment()),
	}
}
