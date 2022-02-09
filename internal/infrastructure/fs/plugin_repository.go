package fs

import (
	"context"
	"path/filepath"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
	"github.com/spf13/afero"
)

type pluginRepository struct {
	fs afero.Fs
}

func NewPluginRepository(fs afero.Fs) gateway.PluginRepository {
	return &pluginRepository{
		fs: fs,
	}
}

func (r *pluginRepository) Data(ctx context.Context, id id.PluginID) (file.Iterator, error) {
	return file.NewFsIterator(afero.NewBasePathFs(r.fs, filepath.Join(pluginDir, id.String())))
}

func (r *pluginRepository) Manifest(ctx context.Context, id id.PluginID) (*manifest.Manifest, error) {
	return readPluginManifest(r.fs, id)
}
