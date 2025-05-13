package file

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
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

func FileSizeCheck(sizeMB int, file io.ReadSeeker) error {
	const MB = 1024 * 1024
	maxFileSize := int64(sizeMB) * MB
	fileSize, err := file.Seek(0, io.SeekEnd)
	if err != nil {
		return fmt.Errorf("failed to get file size: %w", err)
	}
	if fileSize > maxFileSize {
		return fmt.Errorf("file size (%.2fMB) exceeds %dMB limit", float64(fileSize)/float64(MB), sizeMB)
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return fmt.Errorf("failed to reset file position: %w", err)
	}
	return nil
}

func UncompressExportZip(currentHost string, file io.ReadSeeker) (*[]byte, map[string]*zip.File, map[string]*zip.File, error) {
	// 500MB
	if err := FileSizeCheck(500, file); err != nil {
		return nil, nil, nil, err
	}
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, nil, nil, err
	}
	reader, err := zip.NewReader(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		return nil, nil, nil, err
	}
	var data []byte
	assets := make(map[string]*zip.File)
	plugins := make(map[string]*zip.File)
	for _, file := range reader.File {
		if file.Name == "project.json" {
			rc, err := file.Open()
			if err != nil {
				return nil, nil, nil, err
			}
			defer func(rc io.ReadCloser) {
				if cerr := rc.Close(); cerr != nil {
					fmt.Printf("Error closing file: %v\n", cerr)
				}
			}(rc)
			data, err = io.ReadAll(rc)
			if err != nil {
				return nil, nil, nil, err
			}
			var d map[string]any
			if err := json.Unmarshal(data, &d); err == nil {
				if e, ok := d["exportedInfo"].(map[string]any); ok {
					if host, ok := e["host"].(string); ok {

						// Replace to current host
						data = bytes.Replace(data, []byte(host), []byte(currentHost), -1)
					}
				}
			}
		} else if strings.HasPrefix(file.Name, "assets/") {
			trimmedName := strings.TrimPrefix(file.Name, "assets/")
			assets[trimmedName] = file
		} else if strings.HasPrefix(file.Name, "plugins/") {
			trimmedName := strings.TrimPrefix(file.Name, "plugins/")
			plugins[trimmedName] = file
		} else {
			return nil, nil, nil, fmt.Errorf("invalid file in zip: %s", file.Name)
		}
	}
	if len(data) == 0 {
		return nil, nil, nil, fmt.Errorf("project.json not found in the zip file")
	}
	return &data, assets, plugins, nil
}
