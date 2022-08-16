package decoding

import (
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/shp"
)

type ShapeReader interface {
	Next() bool
	Shape() (int, shp.Shape)
	Err() error
}
type ShapeDecoder struct {
	reader  ShapeReader
	sceneId layer.SceneID
}

func NewShapeDecoder(r ShapeReader, s layer.SceneID) *ShapeDecoder {
	return &ShapeDecoder{
		reader:  r,
		sceneId: s,
	}
}

func (shd *ShapeDecoder) getLayer(t string, coords interface{}) (*layer.Item, *property.Property, error) {
	var p *property.Property
	var l *layer.Item
	var ex layer.PluginExtensionID
	var err error
	p, err = createProperty(t, coords, shd.sceneId, nil, "")
	if err != nil {
		return nil, nil, err
	}
	ex = extensions[t]
	l, err = layer.
		NewItem().
		NewID().
		Scene(shd.sceneId).
		Property(p.IDRef()).
		Extension(&ex).
		Plugin(&layer.OfficialPluginID).
		Build()
	if err != nil {
		return nil, nil, err
	}
	return l, p, nil
}
func (shd *ShapeDecoder) pointsToCoords(pl []shp.Point) []property.LatLngHeight {
	var ls []property.LatLngHeight
	for _, p := range pl {
		ls = append(ls, property.LatLngHeight{
			Lat: p.Y,
			Lng: p.X,
		})
	}
	return ls
}

func (shd *ShapeDecoder) Decode() (Result, error) {
	lg, err := layer.NewGroup().NewID().Scene(shd.sceneId).Name("ShapeFile").Build()
	if err != nil {
		return Result{}, err
	}
	var properties property.Map
	var layers layer.Map
	for shd.reader.Next() {
		_, shape := shd.reader.Shape()
		var li *layer.Item
		var p *property.Property
		point, okPoint := shape.(*shp.Point)
		polyline, okPolyLine := shape.(*shp.PolyLine)
		polygon, okPolygon := shape.(*shp.Polygon)
		if okPoint {
			li, p, err = shd.getLayer("Point", property.LatLng{
				Lat: point.Y,
				Lng: point.X,
			})
		}
		if okPolyLine {
			li, p, err = shd.getLayer("Polyline", shd.pointsToCoords(polyline.Points))
		}
		if okPolygon {
			li, p, err = shd.getLayer("Polygon", append(make([][]property.LatLngHeight, 1), shd.pointsToCoords(polygon.Points)))
		}
		if err != nil {
			return Result{}, err
		}
		if li != nil {
			var l layer.Layer = li
			lg.Layers().AddLayer(l.ID(), -1)
			layers = layers.Add(&l)
		}
		if p != nil {
			properties = properties.Add(p)
		}
	}

	return resultFrom(lg, layers, properties)
}
