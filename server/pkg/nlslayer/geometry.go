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

	switch geometryType {
	case "Point":
		coordinates, ok := data["coordinates"].([]float64)
		if !ok {
			return nil, errors.New("Point coordinates not found")
		}
		return NewPoint(geometryType, coordinates), nil

	case "LineString":
		coordinates, ok := data["coordinates"].([][]float64)
		if !ok {
			return nil, errors.New("LineString coordinates not found")
		}
		return NewLineString(geometryType, coordinates), nil

	case "Polygon":
		coordinates, ok := data["coordinates"].([][][]float64)
		if !ok {
			return nil, errors.New("Polygon coordinates not found")
		}
		return NewPolygon(geometryType, coordinates), nil

	case "MultiPolygon":
		coordinates, ok := data["coordinates"].([][][][]float64)
		if !ok {
			return nil, errors.New("MultiPolygon coordinates not found")
		}
		return NewMultiPolygon(geometryType, coordinates), nil

	case "GeometryCollection":
		geometriesData, ok := data["geometries"].([]map[string]any)
		if !ok {
			return nil, errors.New("GeometryCollection geometries not found")
		}
		geometries := make([]Geometry, 0, len(geometriesData))
		for _, g := range geometriesData {
			geometry, err := NewGeometryFromMap(g)
			if err != nil {
				return nil, err
			}
			geometries = append(geometries, geometry)
		}
		return NewGeometryCollection(geometryType, geometries), nil

	default:
		return nil, fmt.Errorf("unsupported geometry type: %s", geometryType)
	}
}
