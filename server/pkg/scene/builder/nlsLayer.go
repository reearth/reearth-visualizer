package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/samber/lo"
)

type nlsLayerJSON struct {
	ID             string               `json:"id"`
	Index          *int                 `json:"index,omitempty"`
	Title          string               `json:"title,omitempty"`
	LayerType      string               `json:"layerType,omitempty"`
	Config         *configJSON          `json:"config,omitempty"`
	IsVisible      bool                 `json:"isVisible"`
	Infobox        *nlsInfoboxJSON      `json:"nlsInfobox,omitempty"`
	PhotoOverlay   *nlsPhotoOverlayJSON `json:"nlsPhotoOverlay,omitempty"`
	IsSketch       bool                 `json:"isSketch"`
	SketchInfo     *sketchInfoJSON      `json:"sketchInfo,omitempty"`
	DataSourceName *string              `json:"dataSourceName,omitempty"`
	Children       []*nlsLayerJSON      `json:"children,omitempty"`
}

type configJSON map[string]any

type nlsInfoboxJSON struct {
	ID       string                `json:"id"`
	Property propertyJSON          `json:"property"`
	Blocks   []nlsInfoboxBlockJSON `json:"blocks"`
}

type nlsPhotoOverlayJSON struct {
	ID       string       `json:"id"`
	Property propertyJSON `json:"property"`
}

type nlsInfoboxBlockJSON struct {
	ID          string                  `json:"id"`
	Property    propertyJSON            `json:"property"`
	Plugins     map[string]propertyJSON `json:"plugins"`
	ExtensionId string                  `json:"extensionId"`
	PluginId    string                  `json:"pluginId"`
}

type sketchInfoJSON struct {
	PropertySchema    *map[string]any        `json:"propertySchema,omitempty"`
	FeatureCollection *featureCollectionJSON `json:"featureCollection,omitempty"`
}

type featureCollectionJSON struct {
	Type     string        `json:"type"`
	Features []featureJSON `json:"features"`
}

type featureJSON struct {
	ID         string          `json:"id"`
	Type       string          `json:"type"`
	Geometry   []any           `json:"geometry"`
	Properties *map[string]any `json:"properties"`
}

type pointJSON struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"`
}

type lineStringJSON struct {
	Type        string      `json:"type"`
	Coordinates [][]float64 `json:"coordinates"`
}

type polygonJSON struct {
	Type        string        `json:"type"`
	Coordinates [][][]float64 `json:"coordinates"`
}

type multiPolygonJSON struct {
	Type        string          `json:"type"`
	Coordinates [][][][]float64 `json:"coordinates"`
}

type geometryCollectionJSON struct {
	Type       string `json:"type"`
	Geometries []any  `json:"geometries"`
}

// propertyLoadChunkSize bounds how many property IDs go into a single load. The layer count is
// unbounded, so loading every ID in one call would trade many small queries for one arbitrarily
// large query and result set.
const propertyLoadChunkSize = 500

// nlsLayersJSON collects every layer's property IDs up front and loads them in batches before
// building any JSON, the way scene- and story-level properties already do (see builder.go).
// Loading them per layer instead cost roughly L*(2+B) queries for L layers holding B infobox
// blocks each (SCA-02, AI compliance scan finding).
//
// The b.nlsloader call in getNLSLayerJSON is not part of this and issues no queries today: it only
// runs for layer groups, which nothing can currently create. If groups are ever made real, resolve
// children by indexing *b.nlsLayer on ID rather than loading them, since NLSLayer.FindByScene
// returns children as well as roots and a group already holds its child IDs. The loop below would
// then also need a root filter, or a child would be emitted both nested and at top level.
func (b *Builder) nlsLayersJSON(ctx context.Context) ([]*nlsLayerJSON, error) {

	var res []*nlsLayerJSON

	props := b.loadNLSLayerProperties(ctx)

	for _, l := range *b.nlsLayer {
		if l == nil {
			continue
		}
		if c, _ := b.getNLSLayerJSON(ctx, *l, props); c != nil {
			res = append(res, c)
		}
	}

	return res, nil
}

// loadNLSLayerProperties fetches every property referenced by the scene's layers, keyed by ID.
//
// Load failures are tolerated rather than returned, matching the previous per-layer behaviour: a
// property that cannot be loaded is absent from the map and renders as an empty property, instead
// of failing the whole scene build. Callers look properties up by ID, not by scanning a slice,
// because a large scene has thousands of them and a linear scan per lookup would replace the
// query cost with a quadratic one.
func (b *Builder) loadNLSLayerProperties(ctx context.Context) map[id.PropertyID]*property.Property {
	if b.nlsLayer == nil {
		return nil
	}

	ids := make(id.PropertyIDList, 0)
	seen := make(map[id.PropertyID]struct{})
	add := func(pid id.PropertyID) {
		if _, ok := seen[pid]; ok {
			return
		}
		seen[pid] = struct{}{}
		ids = append(ids, pid)
	}

	for _, l := range *b.nlsLayer {
		if l == nil {
			continue
		}
		layer := *l
		if infobox := layer.Infobox(); infobox != nil {
			add(infobox.Property())
			for _, block := range infobox.Blocks() {
				if block != nil {
					add(block.Property())
				}
			}
		}
		if photooverlay := layer.PhotoOverlay(); photooverlay != nil {
			add(photooverlay.Property())
		}
	}

	if len(ids) == 0 {
		return nil
	}

	res := make(map[id.PropertyID]*property.Property, len(ids))
	for start := 0; start < len(ids); start += propertyLoadChunkSize {
		end := min(start+propertyLoadChunkSize, len(ids))
		loaded, err := b.ploader(ctx, ids[start:end]...)
		if err != nil {
			continue
		}
		for _, p := range loaded {
			if p != nil {
				res[p.ID()] = p
			}
		}
	}

	return res
}

func (b *Builder) getNLSLayerJSON(ctx context.Context, layer nlslayer.NLSLayer, props map[id.PropertyID]*property.Property) (*nlsLayerJSON, error) {

	var children []*nlsLayerJSON
	if lg := nlslayer.ToNLSLayerGroup(layer); lg != nil {
		layers, err := b.nlsloader(ctx, lg.Children().Layers()...)
		if err != nil {
			return nil, err
		}
		for _, c := range layers {
			if c == nil {
				continue
			}
			if d, _ := b.getNLSLayerJSON(ctx, *c, props); d != nil {
				children = append(children, d)
			}
		}
	}

	return &nlsLayerJSON{
		ID:             layer.ID().String(),
		Index:          layer.Index(),
		Title:          layer.Title(),
		LayerType:      string(layer.LayerType()),
		Config:         (*configJSON)(layer.Config()),
		IsVisible:      layer.IsVisible(),
		Infobox:        b.nlsInfoboxJSON(ctx, layer.Infobox(), props),
		PhotoOverlay:   b.nlsPhotoOverlayJSON(ctx, layer.PhotoOverlay(), props),
		IsSketch:       layer.IsSketch(),
		SketchInfo:     b.sketchInfoJSON(ctx, layer.Sketch()),
		DataSourceName: layer.DataSourceName(),
		Children:       children,
	}, nil
}

func (b *Builder) nlsInfoboxJSON(ctx context.Context, infobox *nlslayer.Infobox, props map[id.PropertyID]*property.Property) *nlsInfoboxJSON {
	if infobox == nil {
		return nil
	}

	return &nlsInfoboxJSON{
		ID:       infobox.Id().String(),
		Property: b.property(ctx, props[infobox.Property()]),
		Blocks: lo.FilterMap(infobox.Blocks(), func(block *nlslayer.InfoboxBlock, _ int) (nlsInfoboxBlockJSON, bool) {
			if block == nil {
				return nlsInfoboxBlockJSON{}, false
			}
			return b.nlsInfoboxBlockJSON(ctx, *block, props), true
		}),
	}
}

func (b *Builder) nlsPhotoOverlayJSON(ctx context.Context, photooverlay *nlslayer.PhotoOverlay, props map[id.PropertyID]*property.Property) *nlsPhotoOverlayJSON {
	if photooverlay == nil {
		return nil
	}

	return &nlsPhotoOverlayJSON{
		ID:       photooverlay.Id().String(),
		Property: b.property(ctx, props[photooverlay.Property()]),
	}
}

func (b *Builder) nlsInfoboxBlockJSON(ctx context.Context, block nlslayer.InfoboxBlock, props map[id.PropertyID]*property.Property) nlsInfoboxBlockJSON {
	return nlsInfoboxBlockJSON{
		ID:          block.ID().String(),
		Property:    b.property(ctx, props[block.Property()]),
		Plugins:     nil,
		ExtensionId: block.Extension().String(),
		PluginId:    block.Plugin().String(),
	}
}

func (b *Builder) sketchInfoJSON(ctx context.Context, sketchInfo *nlslayer.SketchInfo) *sketchInfoJSON {
	if sketchInfo == nil {
		return nil
	}

	return &sketchInfoJSON{
		PropertySchema:    sketchInfo.CustomPropertySchema(),
		FeatureCollection: b.featureCollectionJSON(ctx, sketchInfo.FeatureCollection()),
	}
}

func (b *Builder) featureCollectionJSON(ctx context.Context, fc *nlslayer.FeatureCollection) *featureCollectionJSON {
	if fc == nil {
		return nil
	}

	return &featureCollectionJSON{
		Type: fc.FeatureCollectionType(),
		Features: lo.FilterMap(fc.Features(), func(feature nlslayer.Feature, _ int) (featureJSON, bool) {
			return b.featureJSON(ctx, feature), true
		}),
	}
}

func (b *Builder) featureJSON(ctx context.Context, feature nlslayer.Feature) featureJSON {
	return featureJSON{
		ID:         feature.ID().String(),
		Type:       string(feature.FeatureType()),
		Geometry:   b.geometryJSON(ctx, feature.Geometry()),
		Properties: feature.Properties(),
	}
}

func (b *Builder) geometryJSON(ctx context.Context, geometry nlslayer.Geometry) []any {
	if geometry == nil {
		return nil
	}

	switch g := geometry.(type) {
	case *nlslayer.Point:
		return []any{&pointJSON{
			Type:        g.PointType(),
			Coordinates: g.Coordinates(),
		}}
	case *nlslayer.LineString:
		return []any{&lineStringJSON{
			Type:        g.LineStringType(),
			Coordinates: g.Coordinates(),
		}}
	case *nlslayer.Polygon:
		return []any{&polygonJSON{
			Type:        g.PolygonType(),
			Coordinates: g.Coordinates(),
		}}
	case *nlslayer.MultiPolygon:
		return []any{&multiPolygonJSON{
			Type:        g.MultiPolygonType(),
			Coordinates: g.Coordinates(),
		}}
	case *nlslayer.GeometryCollection:
		geometries := make([]any, 0, len(g.Geometries()))
		for _, geom := range g.Geometries() {
			geometries = append(geometries, b.geometryJSON(ctx, geom)...)
		}
		return []any{&geometryCollectionJSON{
			Type:       g.GeometryCollectionType(),
			Geometries: geometries,
		}}
	default:
		return nil
	}
}
