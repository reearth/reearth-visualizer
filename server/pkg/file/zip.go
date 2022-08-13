package file

import (
	"archive/zip"
	"bytes"
	"io"
	"strings"
)

type ZipReader struct {
	zr *zip.Reader
	i  int
}

func NewZipReader(zr *zip.Reader) *ZipReader {
	return &ZipReader{zr: zr}
}

func ZipReaderFrom(r io.Reader, n int64) (*ZipReader, error) {
	b, err := io.ReadAll(io.LimitReader(r, n))
	if err != nil {
		return nil, err
	}

	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	if err != nil {
		return nil, err
	}

	return NewZipReader(zr), nil
}

func (r *ZipReader) Next() (*File, error) {
	if r == nil || r.zr == nil {
		return nil, nil
	}

	if len(r.zr.File) <= r.i {
		return nil, nil
	}

	f := r.zr.File[r.i]
	r.i++

	fi := f.FileInfo()
	if fi.IsDir() {
		return r.Next()
	}

	c, err := f.Open()
	if err != nil {
		return nil, err
	}

	return &File{Content: c, Path: f.Name, Size: fi.Size()}, nil
}

func MockZipReader(files []string) *zip.Reader {
	b := new(bytes.Buffer)
	w := zip.NewWriter(b)
	for _, f := range files {
		_, _ = w.Create(f)
	}
	_ = w.Close()
	b2 := b.Bytes()
	zr, _ := zip.NewReader(bytes.NewReader(b2), int64(len(b2)))
	return zr
}

func ZipBasePath(zr *zip.Reader) (b string) {
	for _, f := range zr.File {
		fp := strings.Split(f.Name, "/")
		if len(fp) <= 1 {
			// a file is existing in the root
			return ""
		}
		// extract root directory name
		if len(fp) == 2 && fp[1] == "" {
			if b != "" {
				// there are multiple directories on the root
				return ""
			}
			b = fp[0]
		}
	}
	return
}
