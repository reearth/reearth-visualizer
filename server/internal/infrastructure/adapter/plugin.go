package adapter

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearthx/rerror"
)

// TODO: Write a width-first search algorithm here to remove the built-in search logic from mongo
type pluginRepo struct {
	readers []repo.Plugin
	writer  repo.Plugin
}

// NewPlugin generates a new repository which has fallback repositories to be used when the plugin is not found
func NewPlugin(readers []repo.Plugin, writer repo.Plugin) repo.Plugin {
	return &pluginRepo{
		readers: append([]repo.Plugin{}, readers...),
		writer:  writer,
	}
}

func (r *pluginRepo) Filtered(f repo.SceneFilter) repo.Plugin {
	readers := make([]repo.Plugin, 0, len(r.readers))
	for _, r := range r.readers {
		readers = append(readers, r.Filtered(f))
	}
	return &pluginRepo{
		readers: readers,
		writer:  r.writer.Filtered(f),
	}
}

func (r *pluginRepo) FindByID(ctx context.Context, id id.PluginID) (*plugin.Plugin, error) {
	for _, re := range r.readers {
		if res, err := re.FindByID(ctx, id); err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				continue
			} else {
				return nil, err
			}
		} else {
			return res, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *pluginRepo) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	results := make([]*plugin.Plugin, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil && err != rerror.ErrNotFound {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *pluginRepo) Save(ctx context.Context, p *plugin.Plugin) error {
	if r.writer == nil {
		return errors.New("cannot write")
	}
	return r.writer.Save(ctx, p)
}

func (r *pluginRepo) Remove(ctx context.Context, p id.PluginID) error {
	if r.writer == nil {
		return errors.New("cannot write")
	}
	return r.writer.Remove(ctx, p)
}
