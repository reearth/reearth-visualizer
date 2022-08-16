package shp

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"math"
)

// Reader provides a interface for reading Shapefiles. Calls
// to the Next method will iterate through the objects in the
// Shapefile. After a call to Next the object will be available
// through the Shape method.
type Reader struct {
	GeometryType ShapeType
	bbox         Box
	err          error

	shp   io.ReadSeeker
	shape Shape
	num   int32
	// filename   string
	filelength int64

	/* Note: not used
	dbf             io.ReadSeeker
	dbfFields       []Field
	dbfNumRecords   int32
	dbfHeaderLength int16
	dbfRecordLength int16*/
}

// ReadFrom read from io.Reader
func ReadFrom(r io.Reader) (*Reader, error) {
	buf := new(bytes.Buffer)
	_, err := buf.ReadFrom(r)
	if err != nil {
		return nil, err
	}
	reader := bytes.NewReader(buf.Bytes())
	sr := &Reader{shp: reader}
	return sr, sr.readHeaders()
}

// BBox returns the bounding box of the shapefile.
func (r *Reader) BBox() Box {
	return r.bbox
}

// Read and parse headers in the Shapefile. This will
// fill out GeometryType, filelength and bbox.
func (r *Reader) readHeaders() error {
	er := &errReader{Reader: r.shp}
	// don't trust the the filelength in the header
	r.filelength, _ = r.shp.Seek(0, io.SeekEnd)

	var filelength int32
	_, err := r.shp.Seek(24, 0)
	if err != nil {
		return err
	}
	// file length
	err = binary.Read(er, binary.BigEndian, &filelength)
	if err != nil {
		return err
	}
	_, err = r.shp.Seek(32, 0)
	if err != nil {
		return err
	}
	err = binary.Read(er, binary.LittleEndian, &r.GeometryType)
	if err != nil {
		return err
	}
	r.bbox.MinX = readFloat64(er)
	r.bbox.MinY = readFloat64(er)
	r.bbox.MaxX = readFloat64(er)
	r.bbox.MaxY = readFloat64(er)
	_, err = r.shp.Seek(100, 0)
	if err != nil {
		return err
	}
	return er.e
}

func readFloat64(r io.Reader) float64 {
	var bits uint64
	_ = binary.Read(r, binary.LittleEndian, &bits)
	return math.Float64frombits(bits)
}

// Close closes the Shapefile.

// Shape returns the most recent feature that was read by
// a call to Next. It returns two values, the int is the
// object index starting from zero in the shapefile which
// can be used as row in ReadAttribute, and the Shape is the object.
func (r *Reader) Shape() (int, Shape) {
	return int(r.num) - 1, r.shape
}

/* Note: not used
// Attribute returns value of the n-th attribute of the most recent feature
// that was read by a call to Next.
func (r *Reader) Attribute(n int) string {
	return r.ReadAttribute(int(r.num)-1, n)
}*/

// newShape creates a new shape with a given type.
func newShape(shapetype ShapeType) (Shape, error) {
	switch shapetype {
	case NULL:
		return new(Null), nil
	case POINT:
		return new(Point), nil
	case POLYLINE:
		return new(PolyLine), nil
	case POLYGON:
		return new(Polygon), nil
	case MULTIPOINT:
		return new(MultiPoint), nil
	case POINTZ:
		return new(PointZ), nil
	case POLYLINEZ:
		return new(PolyLineZ), nil
	case POLYGONZ:
		return new(PolygonZ), nil
	case MULTIPOINTZ:
		return new(MultiPointZ), nil
	case POINTM:
		return new(PointM), nil
	case POLYLINEM:
		return new(PolyLineM), nil
	case POLYGONM:
		return new(PolygonM), nil
	case MULTIPOINTM:
		return new(MultiPointM), nil
	case MULTIPATCH:
		return new(MultiPatch), nil
	default:
		return nil, fmt.Errorf("Unsupported shape type: %v", shapetype)
	}
}

// Next reads in the next Shape in the Shapefile, which
// will then be available through the Shape method. It
// returns false when the reader has reached the end of the
// file or encounters an error.
func (r *Reader) Next() bool {
	cur, _ := r.shp.Seek(0, io.SeekCurrent)
	if cur >= r.filelength {
		return false
	}

	var size int32
	var shapetype ShapeType
	er := &errReader{Reader: r.shp}
	err1 := binary.Read(er, binary.BigEndian, &r.num)
	if err1 != nil {
		r.err = err1
	}
	err1 = binary.Read(er, binary.BigEndian, &size)
	if err1 != nil {
		r.err = err1
	}
	err1 = binary.Read(er, binary.LittleEndian, &shapetype)
	if err1 != nil {
		r.err = err1
	}
	if er.e != nil {
		if er.e != io.EOF {
			r.err = fmt.Errorf("error when reading metadata of next shape: %v", er.e)
		} else {
			r.err = io.EOF
		}
		return false
	}

	var err error
	r.shape, err = newShape(shapetype)
	if err != nil {
		r.err = fmt.Errorf("error decoding shape type: %v", err)
		return false
	}
	err = r.shape.read(er)
	if err != nil {
		r.err = fmt.Errorf("error while reading next shape: %v", err)
		return false
	}
	if er.e != nil {
		r.err = fmt.Errorf("error while reading next shape: %v", er.e)
		return false
	}

	// move to next object
	_, err = r.shp.Seek(int64(size)*2+cur+8, 0)
	if err != nil {
		r.err = fmt.Errorf("error while seeking: %v", err)
		return false
	}
	return true
}

/* Note: not used
// Opens DBF file using r.filename + "dbf". This method
// will parse the header and fill out all dbf* values int
// the f object.
func (r *Reader) openDbf() (err error) {
	if r.dbf != nil {
		return
	}

	r.dbf, err = os.Open(r.filename + ".dbf")
	if err != nil {
		return
	}

	// read header
	_, err = r.dbf.Seek(4, io.SeekStart)
	if err != nil {
		return err
	}
	err = binary.Read(r.dbf, binary.LittleEndian, &r.dbfNumRecords)
	if err != nil {
		return err
	}
	err = binary.Read(r.dbf, binary.LittleEndian, &r.dbfHeaderLength)
	if err != nil {
		return err
	}
	err = binary.Read(r.dbf, binary.LittleEndian, &r.dbfRecordLength)
	if err != nil {
		return err
	}
	_, err = r.dbf.Seek(20, io.SeekCurrent) // skip padding
	if err != nil {
		return err
	}
	numFields := int(math.Floor(float64(r.dbfHeaderLength-33) / 32.0))
	r.dbfFields = make([]Field, numFields)
	err = binary.Read(r.dbf, binary.LittleEndian, &r.dbfFields)
	if err != nil {
		return err
	}
	return
}

// Fields returns a slice of Fields that are present in the
// DBF table.
func (r *Reader) Fields() []Field {
	err := r.openDbf() // make sure we have dbf file to read from
	if err != nil {
		return nil
	}
	return r.dbfFields
}*/

// Err returns the last non-EOF error encountered.
func (r *Reader) Err() error {
	if r.err == io.EOF {
		return nil
	}
	return r.err
}

/* Note: not used
// ReadAttribute returns the attribute value at row for field in
// the DBF table as a string. Both values starts at 0.
func (r *Reader) ReadAttribute(row int, field int) string {
	err := r.openDbf() // make sure we have a dbf file to read from
	if err != nil {
		return ""
	}
	seekTo := 1 + int64(r.dbfHeaderLength) + (int64(row) * int64(r.dbfRecordLength))
	for n := 0; n < field; n++ {
		seekTo += int64(r.dbfFields[n].Size)
	}
	_, err = r.dbf.Seek(seekTo, io.SeekStart)
	if err != nil {
		return ""
	}
	buf := make([]byte, r.dbfFields[field].Size)
	_, err = r.dbf.Read(buf)
	if err != nil {
		return ""
	}
	return strings.Trim(string(buf[:]), " ")
}*/
