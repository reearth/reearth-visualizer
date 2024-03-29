package nlslayer

import (
	"errors"
	"fmt"
)

type Geometry interface{}

type Point struct {
	pointType   string
	coordinates []float64
}

type LineString struct {
	lineStringType string
	coordinates    [][]float64
}

type Polygon struct {
	polygonType string
	coordinates [][][]float64
}

type MultiPolygon struct {
	multiPolygonType string
	coordinates      [][][][]float64
}

type GeometryCollection struct {
	geometryCollectionType string
	geometries             []Geometry
}

func NewPoint(pointType string, coordinates []float64) *Point {
	return &Point{
		pointType:   pointType,
		coordinates: coordinates,
	}
}

func (p *Point) PointType() string {
	return p.pointType
}

func (p *Point) Coordinates() []float64 {
	return append([]float64{}, p.coordinates...)
}

func NewLineString(lineStringType string, coordinates [][]float64) *LineString {
	return &LineString{
		lineStringType: lineStringType,
		coordinates:    coordinates,
	}
}

func (l *LineString) LineStringType() string {
	return l.lineStringType
}

func (l *LineString) Coordinates() [][]float64 {
	return append([][]float64{}, l.coordinates...)
}

func NewPolygon(polygonType string, coordinates [][][]float64) *Polygon {
	return &Polygon{
		polygonType: polygonType,
		coordinates: coordinates,
	}
}

func (p *Polygon) PolygonType() string {
	return p.polygonType
}

func (p *Polygon) Coordinates() [][][]float64 {
	return append([][][]float64{}, p.coordinates...)
}

func NewMultiPolygon(multiPolygonType string, coordinates [][][][]float64) *MultiPolygon {
	return &MultiPolygon{
		multiPolygonType: multiPolygonType,
		coordinates:      coordinates,
	}
}

func (m *MultiPolygon) MultiPolygonType() string {
	return m.multiPolygonType
}

func (m *MultiPolygon) Coordinates() [][][][]float64 {
	return append([][][][]float64{}, m.coordinates...)
}

func NewGeometryCollection(geometryCollectionType string, geometries []Geometry) *GeometryCollection {
	return &GeometryCollection{
		geometryCollectionType: geometryCollectionType,
		geometries:             geometries,
	}
}

func (g *GeometryCollection) GeometryCollectionType() string {
	return g.geometryCollectionType
}

func (g *GeometryCollection) Geometries() []Geometry {
	if g == nil {
		return nil
	}
	return append([]Geometry{}, g.geometries...)
}

func NewGeometryFromMap(data map[string]any) (Geometry, error) {
	geometryType, ok := data["type"].(string)
	if !ok {
		return nil, errors.New("geometry type not found")
	}

	if geometryType == "Point" || geometryType == "LineString" || geometryType == "Polygon" || geometryType == "MultiPolygon" {
		coordinates, ok := data["coordinates"].([]interface{})
		if !ok {
			return nil, errors.New("coordinates not found")
		}

		switch geometryType {
		case "Point":
			var coords []float64
			for _, rawCoord := range coordinates {
				coord, ok := rawCoord.(float64)
				if !ok {
					return nil, errors.New("invalid coordinate format in Point")
				}
				coords = append(coords, coord)
			}
			return NewPoint(geometryType, coords), nil

		case "LineString":
			var coords [][]float64
			for _, rawCoord := range coordinates {
				coord, ok := rawCoord.([]interface{})
				if !ok {
					return nil, errors.New("invalid coordinate format in LineString")
				}
				var lineCoords []float64
				for _, rawLineCoord := range coord {
					lineCoord, ok := rawLineCoord.(float64)
					if !ok {
						return nil, errors.New("invalid coordinate format in LineString")
					}
					lineCoords = append(lineCoords, lineCoord)
				}
				coords = append(coords, lineCoords)
			}
			return NewLineString(geometryType, coords), nil

		case "Polygon":
			var coords [][][]float64
			for _, rawCoord := range coordinates {
				coord, ok := rawCoord.([]interface{})
				if !ok {
					return nil, errors.New("invalid coordinate format in Polygon")
				}
				var polyCoords [][]float64
				for _, rawPolyCoord := range coord {
					polyCoord, ok := rawPolyCoord.([]interface{})
					if !ok {
						return nil, errors.New("invalid coordinate format in Polygon")
					}
					var ringCoords []float64
					for _, rawRingCoord := range polyCoord {
						ringCoord, ok := rawRingCoord.(float64)
						if !ok {
							return nil, errors.New("invalid coordinate format in Polygon")
						}
						ringCoords = append(ringCoords, ringCoord)
					}
					polyCoords = append(polyCoords, ringCoords)
				}
				coords = append(coords, polyCoords)
			}
			return NewPolygon(geometryType, coords), nil

		case "MultiPolygon":
			var coords [][][][]float64
			for _, rawCoord := range coordinates {
				coord, ok := rawCoord.([]interface{})
				if !ok {
					return nil, errors.New("invalid coordinate format in MultiPolygon")
				}
				var multiPolyCoords [][][]float64
				for _, rawMultiPolyCoord := range coord {
					multiPolyCoord, ok := rawMultiPolyCoord.([]interface{})
					if !ok {
						return nil, errors.New("invalid coordinate format in MultiPolygon")
					}
					var polyCoords [][]float64
					for _, rawPolyCoord := range multiPolyCoord {
						polyCoord, ok := rawPolyCoord.([]interface{})
						if !ok {
							return nil, errors.New("invalid coordinate format in MultiPolygon")
						}
						var ringCoords []float64
						for _, rawRingCoord := range polyCoord {
							ringCoord, ok := rawRingCoord.(float64)
							if !ok {
								return nil, errors.New("invalid coordinate format in MultiPolygon")
							}
							ringCoords = append(ringCoords, ringCoord)
						}
						polyCoords = append(polyCoords, ringCoords)
					}
					multiPolyCoords = append(multiPolyCoords, polyCoords)
				}
				coords = append(coords, multiPolyCoords)
			}
			return NewMultiPolygon(geometryType, coords), nil

		default:
			return nil, errors.New("unsupported geometry type")
		}
	}

	if geometryType == "GeometryCollection" {
		geometries, ok := data["geometries"].([]interface{})
		if !ok {
			return nil, errors.New("geometries not found")
		}

		var geometryList []Geometry
		for _, rawGeometry := range geometries {
			geometry, ok := rawGeometry.(map[string]any)
			if !ok {
				return nil, errors.New("invalid geometry format in GeometryCollection")
			}
			geom, err := NewGeometryFromMap(geometry)
			if err != nil {
				return nil, err
			}
			geometryList = append(geometryList, geom)
		}
		return NewGeometryCollection(geometryType, geometryList), nil
	}

	return nil, fmt.Errorf("unsupported geometry type: %s", geometryType)
}
