// Package file provides convenient helpers for files and abstractions of files
package file

import (
	"io"
	"io/fs"
	"strings"

	"github.com/spf13/afero"
)

// File abstracts an abstract file
type File struct {
	Content io.ReadCloser
	Path    string
	Size    int64
	// If the content type is not explicitly specified, ContenType will be an empty string.
	ContentType string
}

// Iterator is an iterator of files
type Iterator interface {
	// Next returns the next File. If there is no next File, returns nil file and nil error
	Next() (*File, error)
}

// For debugging
type SimpleIterator struct {
	c     int
	files []File
}

func NewSimpleIterator(files []File) *SimpleIterator {
	files2 := make([]File, len(files))
	copy(files2, files)
	return &SimpleIterator{
		files: files2,
	}
}

func (s *SimpleIterator) Next() (*File, error) {
	if len(s.files) <= s.c {
		return nil, nil
	}
	n := s.files[s.c]
	s.c++
	return &n, nil
}

type PrefixIterator struct {
	a      Iterator
	prefix string
}

func NewPrefixIterator(a Iterator, prefix string) *PrefixIterator {
	return &PrefixIterator{
		a:      a,
		prefix: prefix,
	}
}

func (s *PrefixIterator) Next() (*File, error) {
	for {
		n, err := s.a.Next()
		if err != nil {
			return nil, err
		}
		if n == nil {
			return nil, nil
		}
		if s.prefix == "" {
			return n, nil
		}
		if strings.HasPrefix(n.Path, s.prefix+"/") {
			n2 := *n
			n2.Path = strings.TrimPrefix(n2.Path, s.prefix+"/")
			return &n2, nil
		}
	}
}

type FilteredIterator struct {
	a       Iterator
	skipper func(p string) bool
}

func NewFilteredIterator(a Iterator, skipper func(p string) bool) *FilteredIterator {
	return &FilteredIterator{
		a:       a,
		skipper: skipper,
	}
}

func (s *FilteredIterator) Next() (*File, error) {
	for {
		n, err := s.a.Next()
		if err != nil {
			return nil, err
		}
		if n == nil {
			return nil, nil
		}
		if !s.skipper(n.Path) {
			return n, nil
		}
	}
}

type FsIterator struct {
	fs    afero.Fs
	files []string
	c     int
}

func NewFsIterator(afs afero.Fs) (*FsIterator, error) {
	var files []string
	var size int64

	if err := afero.Walk(afs, "", func(path string, info fs.FileInfo, err error) error {
		if info.IsDir() {
			return nil
		}
		files = append(files, path)
		size += info.Size()
		return nil
	}); err != nil {
		return nil, err
	}

	return &FsIterator{
		fs:    afs,
		files: files,
		c:     0,
	}, nil
}

func (a *FsIterator) Next() (*File, error) {
	if len(a.files) <= a.c {
		return nil, nil
	}

	next := a.files[a.c]
	a.c++
	fi, err := a.fs.Open(next)
	if err != nil {
		return nil, err
	}

	stat, err := fi.Stat()
	if err != nil {
		return nil, err
	}

	return &File{
		Content: fi,
		Path:    next,
		Size:    stat.Size(),
	}, nil
}
