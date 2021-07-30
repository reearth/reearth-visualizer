package fs

import (
	"context"
	"errors"
	"path"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type pluginRepository struct {
	basePath string
}

func NewPluginRepository(basePath string) gateway.PluginRepository {
	return &pluginRepository{
		basePath: basePath,
	}
}

func (r *pluginRepository) Data(ctx context.Context, id id.PluginID) (file.Archive, error) {
	return r.getArchive(id)
}

func (r *pluginRepository) Manifest(ctx context.Context, id id.PluginID) (*manifest.Manifest, error) {
	archive, err := r.getArchive(id)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = archive.Close()
	}()

	for {
		f, err := archive.Next()
		if errors.Is(err, file.EOF) {
			break
		}
		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}
		if f.Fullpath == manifestFilePath {
			m, err := manifest.Parse(f.Content)
			if err != nil {
				return nil, err
			}
			return m, nil
		}
	}
	return nil, manifest.ErrFailedToParseManifest
}

func (r *pluginRepository) getArchive(id id.PluginID) (file.Archive, error) {
	return NewArchive(
		path.Join(r.basePath, id.Name()+"_"+id.Version().String()),
	)
}
