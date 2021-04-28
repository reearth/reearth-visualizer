package encoding

import (
	"errors"
	"io"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	shp "github.com/reearth/reearth-backend/pkg/shp"
	wsc "github.com/reearth/reearth-backend/pkg/writer"
)

type SHPEncoder struct {
	writer io.Writer
}

func NewSHPEncoder(w io.Writer) *SHPEncoder {
	return &SHPEncoder{
		writer: w,
	}
}

func coordsToPoints(coords property.Coordinates) []shp.Point {
	var res []shp.Point
	for _, l := range coords {
		res = append(res, shp.Point{
			X: l.Lng,
			Y: l.Lat,
		})
	}
	return res
}
func polygonToPoints(poly property.Polygon) ([]shp.Point, []int32) {
	var res []shp.Point
	parts := []int32{0}
	for i, c := range poly {
		partPoints := coordsToPoints(c)
		res = append(res, partPoints...)
		if i > 0 {
			parts = append(parts, int32(len(partPoints)-1))

		}
	}
	return res, parts
}
func getMaxMinPoints(points []shp.Point) (shp.Point, shp.Point) {
	var max, min shp.Point
	max = points[0]
	min = points[0]
	for _, p := range points {
		if p.X > max.X && p.Y > max.Y {
			max = p
		}
		if p.X < min.X && p.Y < min.Y {
			min = p
		}
	}
	return max, min
}
func polygonToSHP(poly property.Polygon) *shp.Polygon {
	points, parts := polygonToPoints(poly)
	max, min := getMaxMinPoints(points)
	res := shp.Polygon{
		Box: shp.Box{
			MinX: min.X,
			MinY: min.Y,
			MaxX: max.X,
			MaxY: max.Y,
		},
		NumParts:  int32(len(poly)),
		NumPoints: int32(len(points)),
		Parts:     parts,
		Points:    points,
	}
	return &res
}
func (e *SHPEncoder) encodeLayer(li *merging.SealedLayerItem) (shp.Shape, shp.ShapeType, error) {
	if li.PluginID == nil || !id.OfficialPluginID.Equal(*li.PluginID) {
		return nil, 0, nil
	}
	var shapeType shp.ShapeType
	var ok bool
	var sh shp.Shape
	switch li.ExtensionID.String() {
	case "marker":
		shapeType = shp.POINT
		latlng := property.LatLng{}
		if li.Property.Field("location") != nil {
			latlng, ok = li.Property.Field("location").PropertyValue.ValueLatLng()
			if !ok {
				return nil, 0, errors.New("invalid value type")
			}
			sh = &shp.Point{
				X: latlng.Lng,
				Y: latlng.Lat,
			}

		}
	case "polygon":
		shapeType = shp.POLYGON
		polygon := property.Polygon{}
		if li.Property.Field("polygon") != nil {
			polygon, ok = li.Property.Field("polygon").PropertyValue.ValuePolygon()
			if !ok {
				return nil, 0, errors.New("invalid value type")
			}
		}
		if len(polygon) > 0 {
			shpPoly := polygonToSHP(polygon)
			sh = shpPoly
		}

	case "polyline":
		shapeType = shp.POLYLINE
		polyline := property.Coordinates{}
		if li.Property.Field("coordinates") != nil {
			polyline, ok = li.Property.Field("coordinates").PropertyValue.ValueCoordinates()
			if !ok {
				return nil, 0, errors.New("invalid value type")
			}
		}
		if len(polyline) > 0 {
			points := coordsToPoints(polyline)
			sh = &shp.PolyLine{
				Box:       shp.Box{MinX: 102, MinY: 0, MaxX: 104, MaxY: 0},
				NumParts:  1,
				NumPoints: int32(len(points)),
				Parts:     []int32{0},
				Points:    points,
			}
		}
	}
	return sh, shapeType, nil
}

func (e *SHPEncoder) encodeLayerGroup(w *wsc.WriterSeeker, li *merging.SealedLayerGroup, shape *shp.Writer) error {
	for _, ch := range li.Children {
		if g, ok := ch.(*merging.SealedLayerGroup); ok {
			err := e.encodeLayerGroup(w, g, shape)
			if err != nil {
				return err
			}
		} else if i, ok := ch.(*merging.SealedLayerItem); ok {
			l, t, err := e.encodeLayer(i)
			if err != nil {
				return err
			}
			if shape == nil {
				shape, err = shp.CreateFrom(w, t)
				if err != nil {
					return err
				}
				defer func() {
					err = shape.Close()

				}()
				if err != nil {
					return err
				}
			}
			_, err = shape.Write(l)
			if err != nil {
				return err
			}
		}
	}
	return nil
}
func (e *SHPEncoder) Encode(layer merging.SealedLayer) error {
	var err error
	var w wsc.WriterSeeker
	if i, ok := layer.(*merging.SealedLayerItem); ok {
		l, t, err := e.encodeLayer(i)
		if err != nil {
			return err
		}
		shape, err := shp.CreateFrom(&w, t)
		if err != nil {
			return err
		}
		defer func() {
			err = shape.Close()

		}()
		if err != nil {
			return err
		}
		_, err = shape.Write(l)
		if err != nil {
			return err
		}
	} else if g, ok := layer.(*merging.SealedLayerGroup); ok {
		err := e.encodeLayerGroup(&w, g, nil)
		if err != nil {
			return err
		}
	}
	_, err = w.WriteTo(e.writer)
	if err != nil {
		return err
	}
	return nil
}
