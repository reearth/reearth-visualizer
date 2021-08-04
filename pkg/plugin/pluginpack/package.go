package pluginpack

import (
	"archive/zip"
	"bytes"
	"io"
	"path"
	"path/filepath"

	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
)

const manfiestFilePath = "reearth.yml"

type Package struct {
	Manifest *manifest.Manifest
	Files    file.Iterator
}

func PackageFromZip(r io.Reader, scene *id.SceneID, sizeLimit int64) (*Package, error) {
	b, err := io.ReadAll(io.LimitReader(r, sizeLimit))
	if err != nil {
		return nil, err
	}

	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	if err != nil {
		return nil, err
	}

	basePath := file.ZipBasePath(zr)
	f, err := zr.Open(path.Join(basePath, manfiestFilePath))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = f.Close()
	}()

	m, err := manifest.Parse(f, scene)
	if err != nil {
		return nil, err
	}

	return &Package{
		Manifest: m,
		Files:    iterator(file.NewZipReader(zr), basePath),
	}, nil
}

func iterator(a file.Iterator, prefix string) file.Iterator {
	return file.NewFilteredIterator(file.NewPrefixIterator(a, prefix), func(p string) bool {
		return p == manfiestFilePath || filepath.Ext(p) != ".js"
	})
}
