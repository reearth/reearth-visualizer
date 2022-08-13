package shp

import (
	"fmt"
	"io"
)

// errReader is a helper to perform multiple successive read from another reader
// and do the error checking only once afterwards. It will not perform any new
// reads in case there was an error encountered earlier.
type errReader struct {
	io.Reader
	e error
	n int64
}

func (er *errReader) Read(p []byte) (n int, err error) {
	if er.e != nil {
		return 0, fmt.Errorf("unable to read after previous error: %v", er.e)
	}
	n, err = er.Reader.Read(p)
	if n < len(p) && err != nil {
		er.e = err
	}
	er.n += int64(n)
	return n, er.e
}
