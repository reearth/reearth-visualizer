package nlslayer

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
