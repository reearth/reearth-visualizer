package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/samber/lo"
)

type nlsLayerJSON struct {
	ID         string          `json:"id"`
	Title      string          `json:"title,omitempty"`
	LayerType  string          `json:"layerType,omitempty"`
	Config     *configJSON     `json:"config,omitempty"`
	IsVisible  bool            `json:"isVisible"`
	Infobox    *nlsInfoboxJSON `json:"nlsInfobox,omitempty"`
	IsSketch   bool            `json:"isSketch"`
	SketchInfo *sketchInfoJSON `json:"sketchInfo,omitempty"`
	Children   []*nlsLayerJSON `json:"children,omitempty"`
}

type configJSON map[string]any

type nlsInfoboxJSON struct {
	ID       string                `json:"id"`
	Property propertyJSON          `json:"property"`
	Blocks   []nlsInfoboxBlockJSON `json:"blocks"`
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
		ID:         layer.ID().String(),
		Title:      layer.Title(),
		LayerType:  string(layer.LayerType()),
		Config:     (*configJSON)(layer.Config()),
		IsVisible:  layer.IsVisible(),
		Infobox:    b.nlsInfoboxJSON(ctx, layer.Infobox()),
		IsSketch:   layer.IsSketch(),
		SketchInfo: b.sketchInfoJSON(ctx, layer.Sketch()),
		Children:   children,
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
