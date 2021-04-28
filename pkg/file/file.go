package file

import (
	"errors"
	"io"
)

var (
	// EOF _
	EOF error = errors.New("eof")
)

// File _
type File struct {
	Content     io.Reader
	Name        string
	Fullpath    string
	Size        int64
	ContentType string
}

// Archive is a file like tarball.
type Archive interface {
	Name() string
	Size() int64
	Next() (*File, error)
	Close() error
}
