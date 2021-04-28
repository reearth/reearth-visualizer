package adapter

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

// TODO: ここで幅優先探索していくアルゴリズムを書いてmongoからビルトインの検索ロジックを除去する
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

func (r *pluginRepo) FindByID(ctx context.Context, id id.PluginID) (*plugin.Plugin, error) {
	for _, re := range r.readers {
		if res, err := re.FindByID(ctx, id); err != nil {
			if errors.Is(err, err1.ErrNotFound) {
				continue
			} else {
				return nil, err
			}
		} else {
			return res, nil
		}
	}
	return nil, err1.ErrNotFound
}

func (r *pluginRepo) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	results := make([]*plugin.Plugin, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil && err != err1.ErrNotFound {
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
