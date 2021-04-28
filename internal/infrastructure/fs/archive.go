package fs

import (
	"os"
	"path"
	"strings"

	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/file"
)

type archive struct {
	p       string
	files   []string
	counter int
	name    string
	size    int64
	fi      *os.File
}

// NewArchive _
func NewArchive(p string) (file.Archive, error) {
	bp := strings.TrimSuffix(p, "/")
	files, size, err := dirwalk(bp, "", 0)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, err1.ErrNotFound
		}
		return nil, err1.ErrInternalBy(err)
	}
	return &archive{
		p:       bp,
		files:   files,
		counter: 0,
		name:    path.Base(p),
		size:    size,
	}, nil
}

// Next _
func (a *archive) Next() (f *file.File, derr error) {
	if len(a.files) <= a.counter {
		return nil, file.EOF
	}
	next := a.files[a.counter]
	a.counter++
	fi, err := os.Open(path.Join(a.p, next))
	if err != nil {
		derr = err1.ErrInternalBy(err)
		return
	}
	stat, err := fi.Stat()
	if err != nil {
		derr = err1.ErrInternalBy(err)
		return
	}

	f = &file.File{
		Content:  fi,
		Name:     stat.Name(),
		Fullpath: strings.TrimPrefix(next, a.p+"/"),
		Size:     stat.Size(),
	}
	return
}

// Close _
func (a *archive) Close() error {
	if a.fi != nil {
		if err := a.fi.Close(); err != nil {
			return err1.ErrInternalBy(err)
		}
		a.fi = nil
	}
	return nil
}

// Name _
func (a *archive) Name() string {
	return a.name
}

// Size _
func (a *archive) Size() int64 {
	return a.size
}

func dirwalk(dir string, base string, size int64) ([]string, int64, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return []string{}, 0, err
	}

	var paths []string
	for _, file := range files {
		if file.IsDir() {
			fname := file.Name()
			dfiles, dsize, err := dirwalk(path.Join(dir, fname), path.Join(base, fname), size)
			if err != nil {
				return []string{}, 0, err
			}
			paths = append(paths, dfiles...)
			size += dsize
			continue
		}
		paths = append(paths, path.Join(base, file.Name()))
		fileInfo, err := file.Info()
		if err != nil {
			return []string{}, 0, err
		}
		size += fileInfo.Size()
	}

	return paths, size, nil
}
