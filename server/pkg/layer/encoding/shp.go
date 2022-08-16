package encoding

import (
	"errors"
	"io"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
	shp "github.com/reearth/reearth/server/pkg/shp"
	wsc "github.com/reearth/reearth/server/pkg/writer"
)

type SHPEncoder struct {
	writer io.Writer
}

func NewSHPEncoder(w io.Writer) *SHPEncoder {
	return &SHPEncoder{
		writer: w,
	}
}

func (*SHPEncoder) MimeType() string {
	return "application/octet-stream"
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
	for i, p := range points {
		if i == 0 || p.X > min.X {
			max.X = p.X
		}
		if i == 0 || p.X < min.X {
			min.X = p.X
		}
		if i == 0 || p.Y > max.Y {
			max.Y = p.Y
		}
		if i == 0 || p.Y < min.Y {
			min.Y = p.Y
		}
	}
	return max, min
}

func coordinatesToSHP(coordinates property.Coordinates) *shp.PolyLine {
	points := coordsToPoints(coordinates)
	max, min := getMaxMinPoints(points)
	return &shp.PolyLine{
		Box: shp.Box{
			MinX: min.X,
			MinY: min.Y,
			MaxX: max.X,
			MaxY: max.Y,
		},
		NumParts:  1,
		NumPoints: int32(len(points)),
		Parts:     []int32{0},
		Points:    points,
	}
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

func (e *SHPEncoder) encodeLayer(li *merging.SealedLayerItem) (sh shp.Shape, st shp.ShapeType, err error) {
	if li.PluginID == nil || !layer.OfficialPluginID.Equal(*li.PluginID) {
		return nil, 0, nil
	}
	switch li.ExtensionID.String() {
	case "marker":
		sh, st = e.encodeMarker(li)
	case "polygon":
		sh, st = e.encodePolygon(li)
	case "polyline":
		sh, st = e.encodePolyline(li)
	}
	if sh == nil || st == 0 {
		return nil, 0, errors.New("invalid value type")
	}
	return sh, st, nil
}

func (e *SHPEncoder) encodeLayerGroup(w *wsc.WriterSeeker, li *merging.SealedLayerGroup, shape *shp.Writer) error {
	for _, ch := range li.Children {
		if g, ok := ch.(*merging.SealedLayerGroup); ok {
			if err := e.encodeLayerGroup(w, g, shape); err != nil {
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
			}

			if _, err := shape.Write(l); err != nil {
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

func (*SHPEncoder) encodeMarker(li *merging.SealedLayerItem) (shp.Shape, shp.ShapeType) {
	f := li.Property.Field("location").Value().ValueLatLng()
	if f == nil {
		return nil, 0
	}
	return &shp.Point{
		X: (*f).Lng,
		Y: (*f).Lat,
	}, shp.POINT
}

func (*SHPEncoder) encodePolygon(li *merging.SealedLayerItem) (shp.Shape, shp.ShapeType) {
	f := li.Property.Field("polygon").Value().ValuePolygon()
	if f == nil || len(*f) == 0 {
		return nil, 0
	}
	return polygonToSHP(*f), shp.POLYGON
}

func (*SHPEncoder) encodePolyline(li *merging.SealedLayerItem) (shp.Shape, shp.ShapeType) {
	f := li.Property.Field("coordinates").Value().ValueCoordinates()
	if f == nil || len(*f) == 0 {
		return nil, 0
	}
	return coordinatesToSHP(*f), shp.POLYLINE
}
