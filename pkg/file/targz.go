package file

import (
	"archive/tar"
	"compress/gzip"
	"errors"
	"io"
)

type TarReader struct {
	tr *tar.Reader
}

func NewTarReader(tr *tar.Reader) *TarReader {
	return &TarReader{tr: tr}
}

func TarReaderFromTarGz(r io.Reader) (*TarReader, error) {
	gzipReader, err := gzip.NewReader(r)
	if err != nil {
		return nil, err
	}
	return &TarReader{tr: tar.NewReader(gzipReader)}, nil
}

func (r *TarReader) Next() (*File, error) {
	if r == nil || r.tr == nil {
		return nil, nil
	}

	h, err := r.tr.Next()
	if errors.Is(err, io.EOF) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	fi := h.FileInfo()
	if fi.IsDir() {
		return r.Next()
	}

	return &File{Content: io.NopCloser(r.tr), Path: h.Name, Size: fi.Size()}, nil
}
