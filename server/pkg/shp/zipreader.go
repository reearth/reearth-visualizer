package shp

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"strings"
)

// ZipReader provides an interface for reading Shapefiles that are compressed in a ZIP archive.
type ZipReader struct {
	sr SequentialReader
	z  *zip.Reader
}

// openFromZIP is convenience function for opening the file called name that is
// compressed in z for reading.
func openFromZIP(z *zip.Reader, name string) (io.ReadCloser, error) {
	for _, f := range z.File {
		if f.Name == name {
			return f.Open()

		}
	}
	return nil, fmt.Errorf("No such file in archive: %s", name)
}

// ReadZipFrom read zip file from io.Reader, zip file must contain only one shape file
func ReadZipFrom(r io.Reader) (*ZipReader, error) {
	zipBytes, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	reader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		return nil, err
	}
	zr := &ZipReader{
		z: reader,
	}
	shapeFiles := shapesInZip(reader)
	if len(shapeFiles) == 0 {
		return nil, fmt.Errorf("archive does not contain a .shp file")
	}
	if len(shapeFiles) > 1 {
		return nil, fmt.Errorf("archive does contain multiple .shp files")
	}
	shp, err := openFromZIP(zr.z, shapeFiles[0].Name)
	if err != nil {
		return nil, err
	}
	/* Note: not used
	withoutExt := strings.TrimSuffix(shapeFiles[0].Name, ".shp")
	// dbf is optional, so no error checking here
	dbf, _ := openFromZIP(zr.z, withoutExt+".dbf")*/
	zr.sr = SequentialReaderFromExt(shp /*, dbf*/)
	return zr, nil
}

func shapesInZip(z *zip.Reader) []*zip.File {
	var shapeFiles []*zip.File
	for _, f := range z.File {
		if strings.HasSuffix(f.Name, ".shp") {
			shapeFiles = append(shapeFiles, f)
		}
	}
	return shapeFiles
}

// Close closes the ZipReader and frees the allocated resources.
func (zr *ZipReader) Close() error {
	err := zr.sr.Close()
	if err != nil {
		return err
	}
	return nil
}

// Next reads the next shape in the shapefile and the next row in the DBF. Call
// Shape() and Attribute() to access the values.
func (zr *ZipReader) Next() bool {
	return zr.sr.Next()
}

// Shape returns the shape that was last read as well as the current index.
func (zr *ZipReader) Shape() (int, Shape) {
	return zr.sr.Shape()
}

/* Note: not used
// Attribute returns the n-th field of the last row that was read. If there
// were any errors before, the empty string is returned.
func (zr *ZipReader) Attribute(n int) string {
	return zr.sr.Attribute(n)
}

// Fields returns a slice of Fields that are present in the
// DBF table.
func (zr *ZipReader) Fields() []Field {
	return zr.sr.Fields()
}*/

// Err returns the last non-EOF error that was encountered by this ZipReader.
func (zr *ZipReader) Err() error {
	return zr.sr.Err()
}
