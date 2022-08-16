package shp

import (
	"encoding/binary"
	"io"
)

//go:generate stringer -type=ShapeType

// ShapeType is a identifier for the the type of shapes.
type ShapeType int32

// These are the possible shape types.
const (
	NULL        ShapeType = 0
	POINT       ShapeType = 1
	POLYLINE    ShapeType = 3
	POLYGON     ShapeType = 5
	MULTIPOINT  ShapeType = 8
	POINTZ      ShapeType = 11
	POLYLINEZ   ShapeType = 13
	POLYGONZ    ShapeType = 15
	MULTIPOINTZ ShapeType = 18
	POINTM      ShapeType = 21
	POLYLINEM   ShapeType = 23
	POLYGONM    ShapeType = 25
	MULTIPOINTM ShapeType = 28
	MULTIPATCH  ShapeType = 31
)

// Box structure made up from four coordinates. This type
// is used to represent bounding boxes
type Box struct {
	MinX, MinY, MaxX, MaxY float64
}

// Extend extends the box with coordinates from the provided
// box. This method calls Box.ExtendWithPoint twice with
// {MinX, MinY} and {MaxX, MaxY}
func (b *Box) Extend(box Box) {
	b.ExtendWithPoint(Point{box.MinX, box.MinY})
	b.ExtendWithPoint(Point{box.MaxX, box.MaxY})
}

// ExtendWithPoint extends box with coordinates from point
// if they are outside the range of the current box.
func (b *Box) ExtendWithPoint(p Point) {
	if p.X < b.MinX {
		b.MinX = p.X
	}
	if p.Y < b.MinY {
		b.MinY = p.Y
	}
	if p.X > b.MaxX {
		b.MaxX = p.X
	}
	if p.Y > b.MaxY {
		b.MaxY = p.Y
	}
}

// BBoxFromPoints returns the bounding box calculated
// from points.
func BBoxFromPoints(points []Point) (box Box) {
	for k, p := range points {
		if k == 0 {
			box = Box{p.X, p.Y, p.X, p.Y}
		} else {
			box.ExtendWithPoint(p)
		}
	}
	return
}

// Shape interface
type Shape interface {
	BBox() Box

	read(io.Reader) error
	write(io.Writer) error
}

// Null is an empty shape.
type Null struct {
}

// BBox Returns an empty BBox at the geometry origin.
func (n Null) BBox() Box {
	return Box{0.0, 0.0, 0.0, 0.0}
}

func (n *Null) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, n)
	if err != nil {
		return err
	}
	return nil
}

func (n *Null) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, n)
	if err != nil {
		return err
	}
	return nil
}

// Point is the shape that consists of single a geometry point.
type Point struct {
	X, Y float64
}

// BBox returns the bounding box of the Point feature, i.e. an empty area at
// the point location itself.
func (p Point) BBox() Box {
	return Box{p.X, p.Y, p.X, p.Y}
}

func (p *Point) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, p)
	if err != nil {
		return err
	}
	return nil
}

func (p *Point) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p)
	if err != nil {
		return err
	}
	return nil
}

func flatten(points [][]Point) []Point {
	n, i := 0, 0
	for _, v := range points {
		n += len(v)
	}
	r := make([]Point, n)
	for _, v := range points {
		for _, p := range v {
			r[i] = p
			i++
		}
	}
	return r
}

// PolyLine is a shape type that consists of an ordered set of vertices that
// consists of one or more parts. A part is a connected sequence of two ore
// more points. Parts may or may not be connected to another and may or may not
// intersect each other.
type PolyLine struct {
	Box
	NumParts  int32
	NumPoints int32
	Parts     []int32
	Points    []Point
}

// NewPolyLine returns a pointer a new PolyLine created
// with the provided points. The inner slice should be
// the points that the parent part consists of.
func NewPolyLine(parts [][]Point) *PolyLine {
	points := flatten(parts)

	p := &PolyLine{}
	p.NumParts = int32(len(parts))
	p.NumPoints = int32(len(points))
	p.Parts = make([]int32, len(parts))
	var marker int32
	for i, part := range parts {
		p.Parts[i] = marker
		marker += int32(len(part))
	}
	p.Points = points
	p.Box = p.BBox()

	return p
}

// BBox returns the bounding box of the PolyLine feature
func (p PolyLine) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *PolyLine) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	return nil
}

func (p *PolyLine) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	return nil
}

// Polygon is identical to the PolyLine struct. However the parts must form
// rings that may not intersect.
type Polygon PolyLine

// BBox returns the bounding box of the Polygon feature
func (p Polygon) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *Polygon) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	return nil
}

func (p *Polygon) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	return nil
}

// MultiPoint is the shape that consists of multiple points.
type MultiPoint struct {
	Box       Box
	NumPoints int32
	Points    []Point
}

// BBox returns the bounding box of the MultiPoint feature
func (p MultiPoint) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *MultiPoint) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Points = make([]Point, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	return nil
}

func (p *MultiPoint) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	return nil
}

// PointZ is a triplet of double precision coordinates plus a measure.
type PointZ struct {
	X float64
	Y float64
	Z float64
	M float64
}

// BBox eturns the bounding box of the PointZ feature which is an zero-sized area
// at the X and Y coordinates of the feature.
func (p PointZ) BBox() Box {
	return Box{p.X, p.Y, p.X, p.Y}
}

func (p *PointZ) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, p)
	if err != nil {
		return err
	}
	return nil
}

func (p *PointZ) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p)
	if err != nil {
		return err
	}
	return nil
}

// PolyLineZ is a shape which consists of one or more parts. A part is a
// connected sequence of two or more points. Parts may or may not be connected
// and may or may not intersect one another.
type PolyLineZ struct {
	Box       Box
	NumParts  int32
	NumPoints int32
	Parts     []int32
	Points    []Point
	ZRange    [2]float64
	ZArray    []float64
	MRange    [2]float64
	MArray    []float64
}

// BBox eturns the bounding box of the PolyLineZ feature.
func (p PolyLineZ) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *PolyLineZ) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	p.ZArray = make([]float64, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *PolyLineZ) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// PolygonZ structure is identical to the PolyLineZ structure.
type PolygonZ PolyLineZ

// BBox returns the bounding box of the PolygonZ feature
func (p PolygonZ) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *PolygonZ) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	p.ZArray = make([]float64, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *PolygonZ) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// MultiPointZ consists of one ore more PointZ.
type MultiPointZ struct {
	Box       Box
	NumPoints int32
	Points    []Point
	ZRange    [2]float64
	ZArray    []float64
	MRange    [2]float64
	MArray    []float64
}

// BBox eturns the bounding box of the MultiPointZ feature.
func (p MultiPointZ) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *MultiPointZ) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Points = make([]Point, p.NumPoints)
	p.ZArray = make([]float64, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *MultiPointZ) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// PointM is a point with a measure.
type PointM struct {
	X float64
	Y float64
	M float64
}

// BBox returns the bounding box of the PointM feature which is a zero-sized
// area at the X- and Y-coordinates of the point.
func (p PointM) BBox() Box {
	return Box{p.X, p.Y, p.X, p.Y}
}

func (p *PointM) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, p)
	if err != nil {
		return err
	}
	return nil
}

func (p *PointM) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p)
	if err != nil {
		return err
	}
	return nil
}

// PolyLineM is the polyline in which each point also has a measure.
type PolyLineM struct {
	Box       Box
	NumParts  int32
	NumPoints int32
	Parts     []int32
	Points    []Point
	MRange    [2]float64
	MArray    []float64
}

// BBox returns the bounding box of the PolyLineM feature.
func (p PolyLineM) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *PolyLineM) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *PolyLineM) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// PolygonM structure is identical to the PolyLineZ structure.
type PolygonM PolyLineZ

// BBox returns the bounding box of the PolygonM feature.
func (p PolygonM) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *PolygonM) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *PolygonM) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// MultiPointM is the collection of multiple points with measures.
type MultiPointM struct {
	Box       Box
	NumPoints int32
	Points    []Point
	MRange    [2]float64
	MArray    []float64
}

// BBox eturns the bounding box of the MultiPointM feature
func (p MultiPointM) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *MultiPointM) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Points = make([]Point, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *MultiPointM) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// MultiPatch consists of a number of surfaces patches. Each surface path
// descries a surface. The surface patches of a MultiPatch are referred to as
// its parts, and the type of part controls how the order of vertices of an
// MultiPatch part is interpreted.
type MultiPatch struct {
	Box       Box
	NumParts  int32
	NumPoints int32
	Parts     []int32
	PartTypes []int32
	Points    []Point
	ZRange    [2]float64
	ZArray    []float64
	MRange    [2]float64
	MArray    []float64
}

// BBox returns the bounding box of the MultiPatch feature
func (p MultiPatch) BBox() Box {
	return BBoxFromPoints(p.Points)
}

func (p *MultiPatch) read(file io.Reader) error {
	err := binary.Read(file, binary.LittleEndian, &p.Box)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.NumPoints)
	if err != nil {
		return err
	}
	p.Parts = make([]int32, p.NumParts)
	p.PartTypes = make([]int32, p.NumParts)
	p.Points = make([]Point, p.NumPoints)
	p.ZArray = make([]float64, p.NumPoints)
	p.MArray = make([]float64, p.NumPoints)
	err = binary.Read(file, binary.LittleEndian, &p.Parts)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.PartTypes)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.Points)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MRange)
	if err != nil {
		return err
	}
	err = binary.Read(file, binary.LittleEndian, &p.MArray)
	if err != nil {
		return err
	}
	return nil
}

func (p *MultiPatch) write(file io.Writer) error {
	err := binary.Write(file, binary.LittleEndian, p.Box)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumParts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.NumPoints)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Parts)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.PartTypes)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.Points)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.ZArray)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MRange)
	if err != nil {
		return err
	}
	err = binary.Write(file, binary.LittleEndian, p.MArray)
	if err != nil {
		return err
	}
	return nil
}

// Field representation of a field object in the DBF file
type Field struct {
	Name      [11]byte
	Fieldtype byte
	Addr      [4]byte // not used
	Size      uint8
	Precision uint8
	Padding   [14]byte
}

/* Note: not used
// Returns a string representation of the Field. Currently
// this only returns field name.
func (f Field) String() string {
	return strings.TrimRight(string(f.Name[:]), "\x00")
}

// StringField returns a Field that can be used in SetFields to initialize the
// DBF file.
func StringField(name string, length uint8) Field {
	// TODO: Error checking
	field := Field{Fieldtype: 'C', Size: length}
	copy(field.Name[:], []byte(name))
	return field
}

// NumberField returns a Field that can be used in SetFields to initialize the
// DBF file.
func NumberField(name string, length uint8) Field {
	field := Field{Fieldtype: 'N', Size: length}
	copy(field.Name[:], []byte(name))
	return field
}

// FloatField returns a Field that can be used in SetFields to initialize the
// DBF file. Used to store floating points with precision in the DBF.
func FloatField(name string, length uint8, precision uint8) Field {
	field := Field{Fieldtype: 'F', Size: length, Precision: precision}
	copy(field.Name[:], []byte(name))
	return field
}

// DateField feturns a Field that can be used in SetFields to initialize the
// DBF file. Used to store Date strings formatted as YYYYMMDD. Data wise this
// is the same as a StringField with length 8.
func DateField(name string) Field {
	field := Field{Fieldtype: 'D', Size: 8}
	copy(field.Name[:], []byte(name))
	return field
}*/
