package fs

import (
	"context"
	"errors"
	"os"
	"path"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type pluginRepo struct {
	basePath string
}

func NewPlugin(basePath string) repo.Plugin {
	return &pluginRepo{
		basePath: basePath,
	}
}

func (r *pluginRepo) manifest(ctx context.Context, id id.PluginID) string {
	return path.Join(getPluginFilePath(r.basePath, id, manifestFilePath))
}

func (r *pluginRepo) FindByID(ctx context.Context, id id.PluginID) (*plugin.Plugin, error) {
	filename := r.manifest(ctx, id)
	if _, err := os.Stat(filename); err != nil {
		return nil, rerror.ErrNotFound
	}
	file, err := os.Open(filename)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = file.Close()
	}()

	m, err := manifest.Parse(file)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	return m.Plugin, nil
}

func (r *pluginRepo) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	results := make([]*plugin.Plugin, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *pluginRepo) Save(ctx context.Context, p *plugin.Plugin) error {
	return rerror.ErrInternalBy(errors.New("read only"))
}
