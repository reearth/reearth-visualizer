package fs

import (
	"path/filepath"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/spf13/afero"
)

const (
	assetDir         = "assets"
	pluginDir        = "plugins"
	publishedDir     = "published"
	manifestFilePath = "reearth.yml"
)

func readManifest(fs afero.Fs, pid id.PluginID) (*manifest.Manifest, error) {
	f, err := fs.Open(filepath.Join(pluginDir, pid.String(), manifestFilePath))
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = f.Close()
	}()

	m, err := manifest.Parse(f, nil)
	if err != nil {
		return nil, err
	}

	return m, nil
}
