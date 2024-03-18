package mongodoc

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/scene"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/exp/slices"
)

type NLSLayerDocument struct {
	ID        string
	Title     string
	Visible   bool
	Scene     string
	LayerType string
	Infobox   *NLSLayerInfoboxDocument
	Simple    *NLSLayerSimpleDocument
	Group     *NLSLayerGroupDocument
	IsSketch  bool
	Sketch    *NLSLayerSketchInfoDocument
}

type NLSLayerSimpleDocument struct {
	Config map[string]any
}

type NLSLayerGroupDocument struct {
	Children []string
	Root     bool
	Config   map[string]any
}

type NLSLayerConsumer = Consumer[*NLSLayerDocument, nlslayer.NLSLayer]

type NLSLayerInfoboxBlockDocument struct {
	ID        string
	Property  string
	Plugin    string
	Extension string
}

type NLSLayerInfoboxDocument struct {
	Property string
	Blocks   []NLSLayerInfoboxBlockDocument
}

type NLSLayerSketchInfoDocument struct {
	CustomPropertySchema *map[string]any
	FeatureCollection    *NLSLayerFeatureCollectionDocument
}

type NLSLayerFeatureCollectionDocument struct {
	Type     string
	Features []NLSLayerFeatureDocument
}

type NLSLayerFeatureDocument struct {
	ID         string
	Type       string
	Geometry   map[string]any
	Properties map[string]any
}

type NLSLayerGeometryDocument interface{}

type NLSLayerPointDocument struct {
	Type        string
	Coordinates []float64
}

type NLSLayerLineString struct {
	Type        string
	Coordinates [][]float64
}

type NLSLayerPolygonDocument struct {
	Type        string
	Coordinates [][][]float64
}

type NLSLayerMultiPolygonDocument struct {
	Type        string
	Coordinates [][][][]float64
}

type NLSLayerGeometryCollectionDocument struct {
	Type string
	// Geometries []NLSLayerGeometryDocument
	Geometries []map[string]any
}

func NewNLSLayerConsumer(scenes []id.SceneID) *NLSLayerConsumer {
	return NewConsumer[*NLSLayerDocument, nlslayer.NLSLayer](func(a nlslayer.NLSLayer) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewNLSLayer(l nlslayer.NLSLayer) (*NLSLayerDocument, string) {
	var group *NLSLayerGroupDocument
	var simple *NLSLayerSimpleDocument

	if lg := nlslayer.NLSLayerGroupFromLayer(l); lg != nil {
		group = &NLSLayerGroupDocument{
			Children: lg.Children().Strings(),
			Root:     lg.IsRoot(),
			Config:   *lg.Config(),
		}
	}

	if ls := nlslayer.NLSLayerSimpleFromLayer(l); ls != nil {
		simple = &NLSLayerSimpleDocument{
			Config: *ls.Config(),
		}
	}

	id := l.ID().String()
	return &NLSLayerDocument{
		ID:        id,
		Title:     l.Title(),
		Visible:   l.IsVisible(),
		Scene:     l.Scene().String(),
		Infobox:   NewNLSInfobox(l.Infobox()),
		LayerType: string(l.LayerType()),
		Group:     group,
		Simple:    simple,
		IsSketch:  l.IsSketch(),
		Sketch:    NewNLSLayerSketchInfo(l.Sketch()),
	}, id
}

func NewNLSLayers(layers nlslayer.NLSLayerList, f scene.IDList) ([]interface{}, []string) {
	res := make([]interface{}, 0, len(layers))
	ids := make([]string, 0, len(layers))
	for _, d := range layers {
		if d == nil {
			continue
		}
		d2 := *d
		if d2 == nil || f != nil && !f.Has(d2.Scene()) {
			continue
		}
		r, id := NewNLSLayer(d2)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

func (d *NLSLayerDocument) Model() (nlslayer.NLSLayer, error) {
	if d.Simple != nil {
		li, err := d.ModelSimple()
		if err != nil {
			return nil, err
		}
		return li, nil
	}
	if d.Group != nil {
		lg, err := d.ModelGroup()
		if err != nil {
			return nil, err
		}
		return lg, nil
	}
	return nil, errors.New("invalid layer")
}

func (d *NLSLayerDocument) ModelSimple() (*nlslayer.NLSLayerSimple, error) {
	lid, err := id.NLSLayerIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	sid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}
	ib, err2 := ToModelNLSInfobox(d.Infobox)
	if err2 != nil {
		return nil, err
	}
	sketchInfo, err3 := ToModelNLSLayerSketchInfo(d.Sketch)
	if err3 != nil {
		return nil, err
	}

	return nlslayer.NewNLSLayerSimple().
		ID(lid).
		Title(d.Title).
		LayerType(NewNLSLayerType(d.LayerType)).
		IsVisible(d.Visible).
		Infobox(ib).
		Scene(sid).
		// Simple
		Config(NewNLSLayerConfig(d.Simple.Config)).
		IsSketch(d.IsSketch).
		Sketch(sketchInfo).
		Build()
}

func (d *NLSLayerDocument) ModelGroup() (*nlslayer.NLSLayerGroup, error) {
	lid, err := id.NLSLayerIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	sid, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return nil, err
	}
	ib, err2 := ToModelNLSInfobox(d.Infobox)
	if err2 != nil {
		return nil, err2
	}
	sketchInfo, err3 := ToModelNLSLayerSketchInfo(d.Sketch)
	if err3 != nil {
		return nil, err
	}

	ids := make([]id.NLSLayerID, 0, len(d.Group.Children))
	for _, lgid := range d.Group.Children {
		lid, err := id.NLSLayerIDFrom(lgid)
		if err != nil {
			return nil, err
		}
		ids = append(ids, lid)
	}

	return nlslayer.NewNLSLayerGroup().
		ID(lid).
		Title(d.Title).
		LayerType(NewNLSLayerType(d.LayerType)).
		IsVisible(d.Visible).
		Infobox(ib).
		Scene(sid).
		// group
		Root(d.Group != nil && d.Group.Root).
		Layers(nlslayer.NewIDList(ids)).
		Config(NewNLSLayerConfig(d.Simple.Config)).
		IsSketch(d.IsSketch).
		Sketch(sketchInfo).
		Build()
}

func NewNLSLayerType(p string) nlslayer.LayerType {
	lt, err := nlslayer.NewLayerType(p)
	if err != nil {
		return nlslayer.LayerType("")
	}
	return lt
}

func NewNLSLayerConfig(c map[string]any) *nlslayer.Config {
	config := nlslayer.Config(c)
	return &config
}

func ToModelNLSInfobox(ib *NLSLayerInfoboxDocument) (*nlslayer.Infobox, error) {
	if ib == nil {
		return nil, nil
	}
	pid, err := id.PropertyIDFrom(ib.Property)
	if err != nil {
		return nil, err
	}
	blocks := make([]*nlslayer.InfoboxBlock, 0, len(ib.Blocks))
	for _, f := range ib.Blocks {
		iid, err := id.InfoboxBlockIDFrom(f.ID)
		if err != nil {
			return nil, err
		}
		prid, err := id.PropertyIDFrom(f.Property)
		if err != nil {
			return nil, err
		}
		pid, err := id.PluginIDFrom(f.Plugin)
		if err != nil {
			return nil, err
		}
		ibf, err := nlslayer.NewInfoboxBlock().
			ID(iid).
			Plugin(pid).
			Extension(id.PluginExtensionID(f.Extension)).
			Property(prid).
			Build()
		if err != nil {
			return nil, err
		}
		blocks = append(blocks, ibf)
	}
	return nlslayer.NewInfobox(blocks, pid), nil
}

func ToModelNLSLayerSketchInfo(si *NLSLayerSketchInfoDocument) (*nlslayer.SketchInfo, error) {
	if si == nil {
		return nil, nil
	}

	features := make([]nlslayer.Feature, 0, len(si.FeatureCollection.Features))
	for _, f := range si.FeatureCollection.Features {
		id, err := id.FeatureIDFrom(f.ID)
		if err != nil {
			return nil, err
		}
		geometry, err := ToModelNLSLayerGeometry(f.Geometry)
		if err != nil {
			return nil, err
		}
		feature, err := nlslayer.NewFeatureForRepository(
			id,
			f.Type,
			geometry,
			f.Properties,
		)
		if err != nil {
			return nil, err
		}
		features = append(features, *feature)
	}

	featureCollection := nlslayer.NewFeatureCollection(
		si.FeatureCollection.Type,
		features,
	)

	sketchInfo := nlslayer.NewSketchInfo(
		si.CustomPropertySchema,
		featureCollection,
	)

	return sketchInfo, nil
}

func ToModelNLSLayerGeometry(g map[string]any) (nlslayer.Geometry, error) {
	if g == nil {
		return nil, errors.New("geometry map is nil")
	}

	geometryType, ok := g["type"].(string)
	if !ok {
		return nil, errors.New("geometry type is missing or not a string")
	}

	switch geometryType {
	case "Point":
		rawCoordinates, ok := g["coordinates"]
		if !ok {
			return nil, errors.New("coordinates of point are missing")
		}
		var coordinates []float64
		for _, rawCoord := range rawCoordinates.(primitive.A) {
			coord, ok := rawCoord.(float64)
			if !ok {
				return nil, errors.New("invalid coordinate format of point")
			}
			coordinates = append(coordinates, coord)
		}
		return nlslayer.NewPoint(geometryType, coordinates), nil
	case "LineString":
		coordinates, ok := g["coordinates"].([][]float64)
		if !ok {
			return nil, errors.New("coordinates of line string are missing")
		}
		return nlslayer.NewLineString(geometryType, coordinates), nil
	case "Polygon":
		coordinates, ok := g["coordinates"].([][][]float64)
		if !ok {
			return nil, errors.New("coordinates of polygon are missing")
		}
		return nlslayer.NewPolygon(geometryType, coordinates), nil
	case "MultiPolygon":
		coordinates, ok := g["coordinates"].([][][][]float64)
		if !ok {
			return nil, errors.New("coordinates of multi polygon are missing")
		}
		return nlslayer.NewMultiPolygon(geometryType, coordinates), nil
	case "GeometryCollection":
		geometries, ok := g["geometries"].([]map[string]any)
		if !ok {
			return nil, errors.New("geometries of geometry collection are missing")
		}
		geometryList := make([]nlslayer.Geometry, 0, len(geometries))
		for _, g := range geometries {
			geometry, err := ToModelNLSLayerGeometry(g)
			if err != nil {
				return nil, err
			}
			geometryList = append(geometryList, geometry)
		}
		return nlslayer.NewGeometryCollection(geometryType, geometryList), nil
	}
	return nil, errors.New("invalid geometry type")
}

func NewNLSInfobox(ib *nlslayer.Infobox) *NLSLayerInfoboxDocument {
	if ib == nil {
		return nil
	}
	ibBlocks := ib.Blocks()
	blocks := make([]NLSLayerInfoboxBlockDocument, 0, len(ibBlocks))
	for _, f := range ibBlocks {
		blocks = append(blocks, NLSLayerInfoboxBlockDocument{
			ID:        f.ID().String(),
			Plugin:    f.Plugin().String(),
			Extension: string(f.Extension()),
			Property:  f.Property().String(),
		})
	}
	return &NLSLayerInfoboxDocument{
		Property: ib.Property().String(),
		Blocks:   blocks,
	}
}

func NewNLSLayerSketchInfo(si *nlslayer.SketchInfo) *NLSLayerSketchInfoDocument {
	if si == nil {
		return nil
	}
	return &NLSLayerSketchInfoDocument{
		CustomPropertySchema: si.CustomPropertySchema(),
		FeatureCollection:    NewNLSLayerFeatureCollection(si.FeatureCollection()),
	}
}

func NewNLSLayerFeatureCollection(fc *nlslayer.FeatureCollection) *NLSLayerFeatureCollectionDocument {
	if fc == nil {
		return nil
	}
	features := make([]NLSLayerFeatureDocument, 0, len(fc.Features()))
	for _, f := range fc.Features() {
		features = append(features, NewNLSLayerFeature(f))
	}
	return &NLSLayerFeatureCollectionDocument{
		Type:     fc.FeatureCollectionType(),
		Features: features,
	}
}

func NewNLSLayerFeature(f nlslayer.Feature) NLSLayerFeatureDocument {
	return NLSLayerFeatureDocument{
		ID:         f.ID().String(),
		Type:       f.FeatureType(),
		Geometry:   NewNLSLayerGeometry(f.Geometry()),
		Properties: f.Properties(),
	}
}

// func NewNLSLayerGeometry(g nlslayer.Geometry) NLSLayerGeometryDocument {
func NewNLSLayerGeometry(g nlslayer.Geometry) map[string]any {
	gMap := make(map[string]any)
	switch g := g.(type) {
	case *nlslayer.Point:
		gMap["type"] = g.PointType()
		gMap["coordinates"] = g.Coordinates()
		// return NLSLayerPointDocument{
		// 	Type:        g.PointType(),
		// 	Coordinates: g.Coordinates(),
		// }
	case *nlslayer.LineString:
		gMap["type"] = g.LineStringType()
		gMap["coordinates"] = g.Coordinates()
		// return NLSLayerLineString{
		// 	Type:        g.LineStringType(),
		// 	Coordinates: g.Coordinates(),
		// }
	case *nlslayer.Polygon:
		gMap["type"] = g.PolygonType()
		gMap["coordinates"] = g.Coordinates()
		// return NLSLayerPolygonDocument{
		// 	Type:        g.PolygonType(),
		// 	Coordinates: g.Coordinates(),
		// }
	case *nlslayer.MultiPolygon:
		gMap["type"] = g.MultiPolygonType()
		gMap["coordinates"] = g.Coordinates()
		// return NLSLayerMultiPolygonDocument{
		// 	Type:        g.MultiPolygonType(),
		// 	Coordinates: g.Coordinates(),
		// }
	case *nlslayer.GeometryCollection:
		geometries := make([]NLSLayerGeometryDocument, 0, len(g.Geometries()))
		for _, g := range g.Geometries() {
			geometries = append(geometries, NewNLSLayerGeometry(g))
		}
		gMap["type"] = g.GeometryCollectionType()
		gMap["geometries"] = geometries
		// return NLSLayerGeometryCollectionDocument{
		// 	Type:       g.GeometryCollectionType(),
		// 	Geometries: geometries,
		// }
	}
	return gMap
}
