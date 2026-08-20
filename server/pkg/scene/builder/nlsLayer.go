package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/nlslayer"
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

// nlsLayersJSON builds each layer's JSON one at a time, which issues far more queries than it
// needs to (SCA-02, compliance scan issue #96). There are two separate causes, and fixing only
// the first still leaves the query count scaling with the number of layers.
//
// 1. Property loads. getNLSLayerJSON below loads each layer's infobox, photo overlay and infobox
// block properties through b.ploader one ID at a time, instead of one batched
// b.ploader(ctx, ids...) call the way scene- and story-level properties already do (see
// builder.go). Note the per-block call in nlsInfoboxBlockJSON, so a scene of L layers each
// holding B infobox blocks costs roughly L*(2+B) loads, not L.
//
// This one is fully removable. Every property ID is reachable from data already in memory, so
// once the layer tree is materialized the whole set can be collected in one walk and loaded
// before any JSON is built, with no further queries needed to discover IDs. Load it in
// fixed-size chunks rather than a single call: the layer count is unbounded, so one batched load
// would trade many small queries for one arbitrarily large query and result set. Chunking bounds
// query size and peak memory without limiting what a scene can contain.
//
// 2. Tree traversal. b.nlsloader is called once per layer group to fetch that group's children,
// and a group's children are not known until the group itself has been loaded, so this is a real
// discover-then-fetch cycle that batching properties does not touch. It can still be reduced by
// walking the tree level by level, collecting every group at one depth and issuing a single
// nlsloader call for all of their children, which makes the traversal cost track tree depth
// rather than group count.
//
// Capping the number of layers per scene would bound the total, but it is a product decision
// rather than a substitute for either fix, since a capped scene still issues one load per layer.
// If a cap is wanted, the policy checker is the natural home for it (see
// internal/usecase/gateway/policy_checker.go, alongside the existing asset size and custom domain
// count checks), so the limit can vary per workspace instead of being a global constant.
//
// Left as a comment for now rather than fixed: this is a performance concern, not a security one,
// and today's scenes are small enough that the extra round trips do not show up in practice.
func (b *Builder) nlsLayersJSON(ctx context.Context) ([]*nlsLayerJSON, error) {

	var res []*nlsLayerJSON

	for _, l := range *b.nlsLayer {
		if l == nil {
			continue
		}
		if c, _ := b.getNLSLayerJSON(ctx, *l); c != nil {
			res = append(res, c)
		}
	}

	return res, nil
}

func (b *Builder) getNLSLayerJSON(ctx context.Context, layer nlslayer.NLSLayer) (*nlsLayerJSON, error) {

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
			if d, _ := b.getNLSLayerJSON(ctx, *c); d != nil {
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
		Infobox:        b.nlsInfoboxJSON(ctx, layer.Infobox()),
		PhotoOverlay:   b.nlsPhotoOverlayJSON(ctx, layer.PhotoOverlay()),
		IsSketch:       layer.IsSketch(),
		SketchInfo:     b.sketchInfoJSON(ctx, layer.Sketch()),
		DataSourceName: layer.DataSourceName(),
		Children:       children,
	}, nil
}

func (b *Builder) nlsInfoboxJSON(ctx context.Context, infobox *nlslayer.Infobox) *nlsInfoboxJSON {
	if infobox == nil {
		return nil
	}

	p, _ := b.ploader(ctx, infobox.Property())

	return &nlsInfoboxJSON{
		ID:       infobox.Id().String(),
		Property: b.property(ctx, findProperty(p, infobox.Property())),
		Blocks: lo.FilterMap(infobox.Blocks(), func(block *nlslayer.InfoboxBlock, _ int) (nlsInfoboxBlockJSON, bool) {
			if block == nil {
				return nlsInfoboxBlockJSON{}, false
			}
			return b.nlsInfoboxBlockJSON(ctx, *block), true
		}),
	}
}

func (b *Builder) nlsPhotoOverlayJSON(ctx context.Context, photooverlay *nlslayer.PhotoOverlay) *nlsPhotoOverlayJSON {
	if photooverlay == nil {
		return nil
	}

	p, _ := b.ploader(ctx, photooverlay.Property())

	return &nlsPhotoOverlayJSON{
		ID:       photooverlay.Id().String(),
		Property: b.property(ctx, findProperty(p, photooverlay.Property())),
	}
}

func (b *Builder) nlsInfoboxBlockJSON(ctx context.Context, block nlslayer.InfoboxBlock) nlsInfoboxBlockJSON {
	p, _ := b.ploader(ctx, block.Property())
	return nlsInfoboxBlockJSON{
		ID:          block.ID().String(),
		Property:    b.property(ctx, findProperty(p, block.Property())),
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
