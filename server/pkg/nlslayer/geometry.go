package nlslayer

import (
	"encoding/json"
	"fmt"
)

type Geometry interface{}

type Point struct {
	Type           string    `json:"type"`
	CoordinatesVal []float64 `json:"coordinates"`
}

type LineString struct {
	Type           string      `json:"type"`
	CoordinatesVal [][]float64 `json:"coordinates"`
}

type Polygon struct {
	Type           string        `json:"type"`
	CoordinatesVal [][][]float64 `json:"coordinates"`
}

type MultiPolygon struct {
	Type           string          `json:"type"`
	CoordinatesVal [][][][]float64 `json:"coordinates"`
}

type GeometryCollection struct {
	Type          string     `json:"type"`
	GeometriesVal []Geometry `json:"geometries"`
}

func NewPoint(pointType string, coordinates []float64) *Point {
	return &Point{
		Type:           pointType,
		CoordinatesVal: coordinates,
	}
}

func (p *Point) PointType() string {
	return p.Type
}

func (p *Point) Coordinates() []float64 {
	return append([]float64{}, p.CoordinatesVal...)
}

func NewLineString(lineStringType string, coordinates [][]float64) *LineString {
	return &LineString{
		Type:           lineStringType,
		CoordinatesVal: coordinates,
	}
}

func (l *LineString) LineStringType() string {
	return l.Type
}

func (l *LineString) Coordinates() [][]float64 {
	return append([][]float64{}, l.CoordinatesVal...)
}

func NewPolygon(polygonType string, coordinates [][][]float64) *Polygon {
	return &Polygon{
		Type:           polygonType,
		CoordinatesVal: coordinates,
	}
}

func (p *Polygon) PolygonType() string {
	return p.Type
}

func (p *Polygon) Coordinates() [][][]float64 {
	return append([][][]float64{}, p.CoordinatesVal...)
}

func NewMultiPolygon(multiPolygonType string, coordinates [][][][]float64) *MultiPolygon {
	return &MultiPolygon{
		Type:           multiPolygonType,
		CoordinatesVal: coordinates,
	}
}

func (m *MultiPolygon) MultiPolygonType() string {
	return m.Type
}

func (m *MultiPolygon) Coordinates() [][][][]float64 {
	return append([][][][]float64{}, m.CoordinatesVal...)
}

func NewGeometryCollection(geometryCollectionType string, geometries []Geometry) *GeometryCollection {
	return &GeometryCollection{
		Type:          geometryCollectionType,
		GeometriesVal: geometries,
	}
}

func (g *GeometryCollection) GeometryCollectionType() string {
	return g.Type
}

func (g *GeometryCollection) Geometries() []Geometry {
	if g == nil {
		return nil
	}
	return append([]Geometry{}, g.GeometriesVal...)
}

func UnmarshalGeometry(data json.RawMessage) (Geometry, error) {
	var temp struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &temp); err != nil {
		return nil, err
	}

	switch temp.Type {
	case "Point":
		var point Point
		if err := json.Unmarshal(data, &point); err != nil {
			return nil, err
		}
		return &point, nil

	case "LineString":
		var line LineString
		if err := json.Unmarshal(data, &line); err != nil {
			return nil, err
		}
		return &line, nil

	case "Polygon":
		var polygon Polygon
		if err := json.Unmarshal(data, &polygon); err != nil {
			return nil, err
		}
		return &polygon, nil

	case "MultiPolygon":
		var multi MultiPolygon
		if err := json.Unmarshal(data, &multi); err != nil {
			return nil, err
		}
		return &multi, nil

	case "GeometryCollection":
		var collection GeometryCollection
		if err := json.Unmarshal(data, &collection); err != nil {
			return nil, err
		}
		return &collection, nil

	default:
		return nil, fmt.Errorf("unsupported geometry type: %s", temp.Type)
	}
}
