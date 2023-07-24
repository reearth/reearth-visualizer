package pluginpack

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"path"
	"path/filepath"
	"regexp"

	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/plugin/manifest"
	"github.com/reearth/reearthx/rerror"
)

const manfiestFilePath = "reearth.yml"

var translationFileNameRegexp = regexp.MustCompile(`reearth_([a-zA-Z]+(?:-[a-zA-Z]+)?).yml`)

type Package struct {
	Manifest *manifest.Manifest
	Files    file.Iterator
}

func PackageFromZip(r io.Reader, scene *plugin.SceneID, sizeLimit int64) (*Package, error) {
	b, err := io.ReadAll(io.LimitReader(r, sizeLimit))
	if err != nil {
		return nil, rerror.From("zip read error", err)
	}

	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	if err != nil {
		return nil, rerror.From("zip open error", err)
	}

	basePath := file.ZipBasePath(zr)

	f, err := zr.Open(path.Join(basePath, manfiestFilePath))
	if err != nil {
		return nil, rerror.From("manifest open error", err)
	}
	defer func() {
		_ = f.Close()
	}()

	translations, err := readTranslation(zr, basePath)
	if err != nil {
		return nil, err
	}

	m, err := manifest.Parse(f, scene, translations.TranslatedRef())
	if err != nil {
		return nil, rerror.From("invalid manifest", err)
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

func readTranslation(fs *zip.Reader, base string) (manifest.TranslationMap, error) {
	translationMap := manifest.TranslationMap{}
	for _, f := range fs.File {
		if filepath.Dir(f.Name) != base {
			continue
		}

		lang := translationFileNameRegexp.FindStringSubmatch(filepath.Base(f.Name))
		if len(lang) == 0 {
			continue
		}
		langfile, err := f.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open translation file: %w", err)
		}
		defer func() {
			_ = langfile.Close()
		}()
		t, err := manifest.ParseTranslation(langfile)
		if err != nil {
			return nil, err
		}
		translationMap[lang[1]] = t
	}

	return translationMap, nil
}
