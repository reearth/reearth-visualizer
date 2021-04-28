package builder

import (
	"context"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type sceneJSON struct {
	SchemaVersion int                     `json:"schemaVersion"`
	ID            string                  `json:"id"`
	PublishedAt   time.Time               `json:"publishedAt"`
	Property      propertyJSON            `json:"property"`
	Plugins       map[string]propertyJSON `json:"plugins"`
	Layers        []*layerJSON            `json:"layers"`
	Widgets       []*widgetJSON           `json:"widgets"`
}

type widgetJSON struct {
	PluginID    string       `json:"pluginId"`
	ExtensionID string       `json:"extensionId"`
	Property    propertyJSON `json:"property"`
}

func (b *Builder) scene(ctx context.Context, s *scene.Scene, publishedAt time.Time, l []*layerJSON, p []*property.Property) *sceneJSON {
	return &sceneJSON{
		SchemaVersion: version,
		ID:            s.ID().String(),
		PublishedAt:   publishedAt,
		Property:      b.property(ctx, findProperty(p, s.Property())),
		Plugins:       b.plugins(ctx, s, p),
		Widgets:       b.widgets(ctx, s, p),
		Layers:        l,
	}
}

func (b *Builder) plugins(ctx context.Context, s *scene.Scene, p []*property.Property) map[string]propertyJSON {
	scenePlugins := s.PluginSystem().Plugins()
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
	sceneWidgets := s.WidgetSystem().Widgets()
	res := make([]*widgetJSON, 0, len(sceneWidgets))
	for _, w := range sceneWidgets {
		if !w.Enabled() {
			continue
		}
		res = append(res, &widgetJSON{
			PluginID:    w.Plugin().String(),
			ExtensionID: string(w.Extension()),
			Property:    b.property(ctx, findProperty(p, w.Property())),
		})
	}
	return res
}

func (b *Builder) property(ctx context.Context, p *property.Property) propertyJSON {
	return property.SealProperty(ctx, p).Interface()
}

func findProperty(pp []*property.Property, i id.PropertyID) *property.Property {
	for _, p := range pp {
		if p.ID() == i {
			return p
		}
	}
	return nil
}
