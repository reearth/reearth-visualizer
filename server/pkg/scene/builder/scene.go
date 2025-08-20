package builder

import (
	"context"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
)

type sceneJSON struct {
	SchemaVersion     int                     `json:"schemaVersion"`
	ID                string                  `json:"id"`
	PublishedAt       time.Time               `json:"publishedAt"`
	Property          propertyJSON            `json:"property"`
	Plugins           map[string]propertyJSON `json:"plugins"`
	Widgets           []*widgetJSON           `json:"widgets"`
	WidgetAlignSystem *widgetAlignSystemsJSON `json:"widgetAlignSystem"`
	Story             *storyJSON              `json:"story,omitempty"`
	NLSLayers         []*nlsLayerJSON         `json:"nlsLayers"`
	LayerStyles       []*layerStylesJSON      `json:"layerStyles"`
	CoreSupport       bool                    `json:"coreSupport"`
	EnableGA          bool                    `json:"enableGa"`
	TrackingID        string                  `json:"trackingId"`
}

func (b *Builder) sceneJSON(ctx context.Context, publishedAt time.Time, p []*property.Property, coreSupport bool, enableGa bool, trackingId string) (*sceneJSON, error) {
	return &sceneJSON{
		SchemaVersion:     version,
		ID:                b.scene.ID().String(),
		PublishedAt:       publishedAt,
		Property:          b.property(ctx, findProperty(p, b.scene.Property())),
		Plugins:           b.plugins(ctx, p),
		Widgets:           b.widgets(ctx, p),
		WidgetAlignSystem: buildWidgetAlignSystems(b.scene.Widgets().Alignment()),
		CoreSupport:       coreSupport,
		EnableGA:          enableGa,
		TrackingID:        trackingId,
	}, nil
}

func (b *Builder) plugins(ctx context.Context, p []*property.Property) map[string]propertyJSON {
	plugins := b.scene.Plugins().Plugins()
	res := map[string]propertyJSON{}
	for _, sp := range plugins {
		if sp == nil {
			continue
		}
		if pp := sp.Property(); pp != nil {
			res[sp.Plugin().String()] = b.property(ctx, findProperty(p, *pp))
		}
	}
	return res
}

func (b *Builder) widgets(ctx context.Context, p []*property.Property) []*widgetJSON {
	sceneWidgets := b.scene.Widgets().Widgets()
	res := make([]*widgetJSON, 0, len(sceneWidgets))
	for _, w := range sceneWidgets {
		if !b.exportType && !w.Enabled() {
			continue
		}

		res = append(res, &widgetJSON{
			ID:          w.ID().String(),
			PluginID:    w.Plugin().String(),
			ExtensionID: string(w.Extension()),
			Property:    b.property(ctx, findProperty(p, w.Property())),
			Enabled:     w.Enabled(),
			Extended:    w.Extended(),
		})
	}
	return res
}

func (b *Builder) property(ctx context.Context, p *property.Property) propertyJSON {
	return property.SealProperty(ctx, p).Interface(b.exportType)
}

func findProperty(pp []*property.Property, i id.PropertyID) *property.Property {
	for _, p := range pp {
		if p != nil && p.ID() == i {
			return p
		}
	}
	return nil
}

func toString(wids []id.WidgetID) []string {
	if wids == nil {
		return nil
	}
	docids := make([]string, 0, len(wids))
	for _, wid := range wids {
		docids = append(docids, wid.String())
	}
	return docids
}

func buildWidgetAlignSystems(ss *scene.WidgetAlignSystems) *widgetAlignSystemsJSON {
	if ss == nil {
		return nil
	}
	wass := widgetAlignSystemsJSON{
		Desktop: buildWidgetAlignSystem(ss.System(scene.WidgetAlignSystemTypeDesktop)),
		Mobile:  buildWidgetAlignSystem(ss.System(scene.WidgetAlignSystemTypeMobile)),
	}
	if wass.Desktop == nil && wass.Mobile == nil {
		return nil
	}
	return &wass
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
		WidgetIDs:  toString(a.WidgetIDs()),
		Align:      string(a.Alignment()),
		Padding:    buildWidgetAreaPadding(a.Padding()),
		Gap:        a.Gap(),
		Centered:   a.Centered(),
		Background: a.Background(),
	}
}
func buildWidgetAreaPadding(p *scene.WidgetAreaPadding) *widgetAreaPaddingJSON {
	if p == nil {
		return nil
	}
	return &widgetAreaPaddingJSON{
		Top:    p.Top(),
		Bottom: p.Bottom(),
		Left:   p.Left(),
		Right:  p.Right(),
	}
}
