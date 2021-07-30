package npm

import (
	"archive/tar"
	"compress/gzip"
	"errors"
	"io"
	"strings"

	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type archive struct {
	gzipReader *gzip.Reader
	tarReader  *tar.Reader
	name       string
	size       int64
}

// NewArchive _
func NewArchive(reader io.Reader, name string, size int64) file.Archive {
	gzipReader, _ := gzip.NewReader(reader)
	tarReader := tar.NewReader(gzipReader)
	return &archive{
		gzipReader: gzipReader,
		tarReader:  tarReader,
		name:       name,
		size:       size,
	}
}

// Next _
func (a *archive) Next() (f *file.File, derr error) {
	var head *tar.Header
	var err error
	for {
		head, err = a.tarReader.Next()
		if errors.Is(err, io.EOF) {
			derr = file.EOF
			return
		}
		if err != nil {
			derr = rerror.ErrInternalBy(err)
			return
		}
		if strings.HasPrefix(head.Name, "package/") {
			break
		}
	}
	f = &file.File{
		Content:  a.tarReader,
		Name:     head.FileInfo().Name(),
		Fullpath: strings.TrimPrefix(head.Name, "package/"),
		Size:     head.Size,
	}
	return
}

// Close _
func (a *archive) Close() error {
	return a.gzipReader.Close()
}

// Name _
func (a *archive) Name() string {
	return a.name
}

// Size _
func (a *archive) Size() int64 {
	return a.size
}
