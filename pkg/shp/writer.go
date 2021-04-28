package shp

import (
	"encoding/binary"
	"io"
	"math"
)

// Writer is the type that is used to write a new shapefile.
type Writer struct {
	shp          io.WriteSeeker
	GeometryType ShapeType
	num          int32
	bbox         Box
}

func CreateFrom(ws io.WriteSeeker, t ShapeType) (*Writer, error) {
	_, err := ws.Seek(100, io.SeekStart)
	if err != nil {
		return nil, err
	}
	w := &Writer{
		shp:          ws,
		GeometryType: t,
	}
	return w, nil
}

// Write shape to the writer.
// Returns the index of the written object
// which can be used in WriteAttribute.
func (w *Writer) Write(shape Shape) (int32, error) {
	// increate bbox
	if w.num == 0 {
		w.bbox = shape.BBox()
	} else {
		w.bbox.Extend(shape.BBox())
	}

	w.num++
	err := binary.Write(w.shp, binary.BigEndian, w.num)
	if err != nil {
		return 0, err
	}
	_, err = w.shp.Seek(4, io.SeekCurrent)
	if err != nil {
		return 0, err
	}
	start, err := w.shp.Seek(0, io.SeekCurrent)
	if err != nil {
		return 0, err
	}
	err = binary.Write(w.shp, binary.LittleEndian, w.GeometryType)
	if err != nil {
		return 0, err
	}
	err = shape.write(w.shp)
	if err != nil {
		return 0, err
	}
	finish, err := w.shp.Seek(0, io.SeekCurrent)
	if err != nil {
		return 0, err
	}
	length := int32(math.Floor((float64(finish) - float64(start)) / 2.0))
	_, err = w.shp.Seek(start-4, io.SeekStart)
	if err != nil {
		return 0, err
	}
	err = binary.Write(w.shp, binary.BigEndian, length)
	if err != nil {
		return 0, err
	}
	_, err = w.shp.Seek(finish, io.SeekStart)
	if err != nil {
		return 0, err
	}
	return w.num - 1, nil
}

// Close closes the writer.
func (w *Writer) Close() error {
	return w.writeHeader(w.shp)
}

// writeHeader writes SHP to ws.
func (w *Writer) writeHeader(ws io.WriteSeeker) error {
	filelength, _ := ws.Seek(0, io.SeekEnd)
	if filelength == 0 {
		filelength = 100
	}
	_, err := ws.Seek(0, io.SeekStart)
	if err != nil {
		return err
	}
	// file code
	err = binary.Write(ws, binary.BigEndian, []int32{9994, 0, 0, 0, 0, 0})
	if err != nil {
		return err
	}
	// file length
	err = binary.Write(ws, binary.BigEndian, int32(filelength/2))
	if err != nil {
		return err
	}
	// version and shape type
	err = binary.Write(ws, binary.LittleEndian, []int32{1000, int32(w.GeometryType)})
	if err != nil {
		return err
	}
	// bounding box
	err = binary.Write(ws, binary.LittleEndian, w.bbox)
	if err != nil {
		return err
	}
	// elevation, measure
	err = binary.Write(ws, binary.LittleEndian, []float64{0.0, 0.0, 0.0, 0.0})
	if err != nil {
		return err
	}
	return nil
}
