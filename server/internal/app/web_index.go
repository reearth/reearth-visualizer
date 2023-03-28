package app

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"regexp"
	"time"

	"github.com/spf13/afero"
)

var reTitle = regexp.MustCompile("<title>(.+?)</title>")
var reFavicon = regexp.MustCompile("<link rel=\"icon\" href=\"(.+?)\"")

func rewriteHTML(html, title, favicon string) string {
	if title != "" {
		html = reTitle.ReplaceAllString(html, fmt.Sprintf("<title>%s</title>", title))
	}
	if favicon != "" {
		html = reFavicon.ReplaceAllString(html, fmt.Sprintf("<link rel=\"icon\" href=\"%s\"", favicon))
	}
	return html
}

type AdapterFS struct {
	FSU afero.Fs
	FS  afero.Fs
}

var _ afero.Fs = (*AdapterFS)(nil)

func (fs *AdapterFS) Create(name string) (afero.File, error) {
	return fs.FS.Create(name)
}

func (fs *AdapterFS) Mkdir(name string, perm os.FileMode) error {
	return fs.FS.Mkdir(name, perm)
}

func (fs *AdapterFS) MkdirAll(path string, perm os.FileMode) error {
	return fs.FS.MkdirAll(path, perm)
}

func (fs *AdapterFS) Open(name string) (afero.File, error) {
	if f, err := fs.FSU.Open(name); err == nil {
		return f, nil
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	return fs.FS.Open(name)
}

func (fs *AdapterFS) OpenFile(name string, flag int, perm os.FileMode) (afero.File, error) {
	if f, err := fs.FSU.OpenFile(name, flag, perm); err == nil {
		return f, nil
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	return fs.FS.OpenFile(name, flag, perm)
}

func (fs *AdapterFS) Remove(name string) error {
	return fs.FS.Remove(name)
}

func (fs *AdapterFS) RemoveAll(path string) error {
	return fs.FS.RemoveAll(path)
}

func (fs *AdapterFS) Rename(oldname, newname string) error {
	return fs.FS.Rename(oldname, newname)
}

func (fs *AdapterFS) Stat(name string) (os.FileInfo, error) {
	if f, err := fs.FSU.Stat(name); err == nil {
		return f, nil
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	return fs.FS.Stat(name)
}

func (fs *AdapterFS) Name() string {
	return "adapter"
}

func (fs *AdapterFS) Chmod(name string, mode os.FileMode) error {
	return fs.FS.Chmod(name, mode)
}

func (fs *AdapterFS) Chown(name string, uid, gid int) error {
	return fs.FS.Chown(name, uid, gid)
}

func (fs *AdapterFS) Chtimes(name string, atime time.Time, mtime time.Time) error {
	return fs.FS.Chtimes(name, atime, mtime)
}

func NewRewriteHTMLFS(f afero.Fs, base, title, favicon string) (http.FileSystem, error) {
	index, err := afero.ReadFile(f, path.Join(base, "index.html"))
	if err != nil {
		return nil, err
	}

	indexs := rewriteHTML(string(index), title, favicon)
	mfs := afero.NewMemMapFs()
	if err := afero.WriteFile(mfs, path.Join(base, "index.html"), []byte(indexs), 0666); err != nil {
		return nil, err
	}

	published, err := afero.ReadFile(f, path.Join(base, "published.html"))
	if err != nil {
		return nil, err
	}

	indexps := rewriteHTML(string(published), title, favicon)
	if err := afero.WriteFile(mfs, path.Join(base, "published.html"), []byte(indexps), 0666); err != nil {
		return nil, err
	}

	afs := &AdapterFS{FSU: mfs, FS: f}
	return afero.NewHttpFs(afs), nil
}

func fetchFavicon(url string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code is %d", res.StatusCode)
	}
	defer func() {
		_ = res.Body.Close()
	}()
	b := &bytes.Buffer{}
	_, _ = io.Copy(b, res.Body)
	return b.Bytes(), nil
}
