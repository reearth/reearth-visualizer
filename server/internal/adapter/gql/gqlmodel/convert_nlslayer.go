package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func ToNLSLayerSimple(l *nlslayer.NLSLayerSimple) *NLSLayerSimple {
	if l == nil {
		return nil
	}

	return &NLSLayerSimple{
		ID:        IDFrom(l.ID()),
		SceneID:   IDFrom(l.Scene()),
		Title:     l.Title(),
		Visible:   l.IsVisible(),
		Infobox:   ToNLSInfobox(l.Infobox(), l.ID(), l.Scene()),
		LayerType: string(l.LayerType()),
		Config:    JSON(*l.Config()),
		IsSketch:  l.IsSketch(),
		Sketch:    ToNLSLayerSketchInfo(l.Sketch()),
	}
}

func ToNLSConfig(p JSON) *nlslayer.Config {
	if p == nil {
		return nil
	}
	co := make(nlslayer.Config)

	for key, value := range p {
		co[key] = value
	}
	return &co
}

func ToNLSLayerType(p string) nlslayer.LayerType {
	lt, err := nlslayer.NewLayerType(p)
	if err != nil {
		return nlslayer.LayerType("")
	}
	return lt
}

func ToNLSLayerGroup(l *nlslayer.NLSLayerGroup, parent *id.NLSLayerID) *NLSLayerGroup {
	if l == nil {
		return nil
	}

	return &NLSLayerGroup{
		ID:          IDFrom(l.ID()),
		SceneID:     IDFrom(l.Scene()),
		Title:       l.Title(),
		Visible:     l.IsVisible(),
		Config:      JSON(*l.Config()),
		Infobox:     ToNLSInfobox(l.Infobox(), l.ID(), l.Scene()),
		ChildrenIds: util.Map(l.Children().Layers(), IDFrom[id.NLSLayer]),
	}
}

func ToNLSLayer(l nlslayer.NLSLayer, parent *id.NLSLayerID) NLSLayer {
	if l == nil {
		return nil
	}

	switch la := l.(type) {
	case *nlslayer.NLSLayerSimple:
		return ToNLSLayerSimple(la)
	case *nlslayer.NLSLayerGroup:
		return ToNLSLayerGroup(la, parent)
	}
	return nil
}

func ToNLSLayers(layers nlslayer.NLSLayerList, parent *id.NLSLayerID) []NLSLayer {
	return util.Map(layers, func(l *nlslayer.NLSLayer) NLSLayer {
		return ToNLSLayer(*l, parent)
	})
}

func ToNLSInfoboxBlock(ibf *nlslayer.InfoboxBlock, parentSceneID id.SceneID) *InfoboxBlock {
	if ibf == nil {
		return nil
	}

	return &InfoboxBlock{
		ID:          IDFrom(ibf.ID()),
		SceneID:     IDFrom(parentSceneID),
		PropertyID:  IDFrom(ibf.Property()),
		PluginID:    IDFromPluginID(ibf.Plugin()),
		ExtensionID: ID(ibf.Extension()),
	}
}

func ToInfoboxBlocks(bl []*nlslayer.InfoboxBlock, parentSceneID id.SceneID) []*InfoboxBlock {
	if len(bl) == 0 {
		return []*InfoboxBlock{}
	}
	return lo.Map(bl, func(s *nlslayer.InfoboxBlock, _ int) *InfoboxBlock {
		return ToNLSInfoboxBlock(s, parentSceneID)
	})
}

func ToNLSInfobox(ib *nlslayer.Infobox, parent id.NLSLayerID, parentSceneID id.SceneID) *NLSInfobox {
	if ib == nil {
		return nil
	}

	return &NLSInfobox{
		SceneID:    IDFrom(parentSceneID),
		PropertyID: IDFrom(ib.Property()),
		Blocks:     ToInfoboxBlocks(ib.Blocks(), parentSceneID),
		LayerID:    IDFrom(parent),
	}
}

func ToNLSLayerSketchInfo(si *nlslayer.SketchInfo) *SketchInfo {
	if si == nil {
		return nil
	}

	var customPropertySchema JSON
	if si.CustomPropertySchema() != nil {
		customPropertySchema = JSON(*si.CustomPropertySchema())
	}

	if si.FeatureCollection() == nil {
		return &SketchInfo{
			CustomPropertySchema: customPropertySchema,
			FeatureCollection:    nil,
		}
	}

	var features []*Feature
	for _, f := range si.FeatureCollection().Features() {
		feature := &Feature{
			ID:         IDFrom(f.ID()),
			Type:       f.FeatureType(),
			Geometry:   convertGeometry(f.Geometry()),
			Properties: *ToGoJsonRef(*f.Properties()),
		}
		features = append(features, feature)
	}

	featureCollection := &FeatureCollection{
		Type:     si.FeatureCollection().FeatureCollectionType(),
		Features: features,
	}

	return &SketchInfo{
		CustomPropertySchema: customPropertySchema,
		FeatureCollection:    featureCollection,
	}
}

func ToGoJsonRef(p JSON) *map[string]any {
	if p == nil {
		return nil
	}

	co := make(map[string]any)

	for key, value := range p {
		co[key] = value
	}

	return &co
}

func convertGeometry(g nlslayer.Geometry) Geometry {
	switch g := g.(type) {
	case *nlslayer.Point:
		return Point{
			Type:             g.PointType(),
			PointCoordinates: g.Coordinates(),
		}
	case *nlslayer.LineString:
		return LineString{
			Type:                  g.LineStringType(),
			LineStringCoordinates: g.Coordinates(),
		}
	case *nlslayer.Polygon:
		return Polygon{
			Type:               g.PolygonType(),
			PolygonCoordinates: g.Coordinates(),
		}
	case *nlslayer.MultiPolygon:
		return MultiPolygon{
			Type:                    g.MultiPolygonType(),
			MultiPolygonCoordinates: g.Coordinates(),
		}
	case *nlslayer.GeometryCollection:
		geometries := make([]Geometry, 0, len(g.Geometries()))
		for _, g := range g.Geometries() {
			geometries = append(geometries, convertGeometry(g))
		}
		return GeometryCollection{
			Type:       g.GeometryCollectionType(),
			Geometries: geometries,
		}
	}
	return nil
}
