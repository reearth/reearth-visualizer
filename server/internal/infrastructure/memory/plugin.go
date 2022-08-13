package memory

import (
	"context"
	"errors"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type Plugin struct {
	lock sync.Mutex
	data []*plugin.Plugin
	f    repo.SceneFilter
}

func NewPlugin() repo.Plugin {
	return &Plugin{
		data: []*plugin.Plugin{},
	}
}

func NewPluginWith(items ...*plugin.Plugin) repo.Plugin {
	r := NewPlugin()
	for _, i := range items {
		_ = r.Save(nil, i)
	}
	return r
}

func (r *Plugin) Filtered(f repo.SceneFilter) repo.Plugin {
	return &Plugin{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Plugin) FindByID(ctx context.Context, id id.PluginID) (*plugin.Plugin, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p := builtin.GetPlugin(id); p != nil {
		return p, nil
	}
	for _, p := range r.data {
		if p.ID().Equal(id) {
			if s := p.ID().Scene(); s == nil || r.f.CanRead(*s) {
				return p.Clone(), nil
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Plugin) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*plugin.Plugin{}
	for _, id := range ids {
		if p := builtin.GetPlugin(id); p != nil {
			result = append(result, p)
			continue
		}
		for _, p := range r.data {
			if p.ID().Equal(id) {
				if s := p.ID().Scene(); s == nil || r.f.CanRead(*s) {
					result = append(result, p.Clone())
				} else {
					result = append(result, nil)
				}
			}
		}
	}
	return result, nil
}

func (r *Plugin) Save(ctx context.Context, p *plugin.Plugin) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p.ID().System() {
		return errors.New("cannnot save system plugin")
	}
	if s := p.ID().Scene(); s != nil && !r.f.CanWrite(*s) {
		return repo.ErrOperationDenied
	}

	for i, q := range r.data {
		if q.ID().Equal(p.ID()) {
			r.data = append(r.data[:i], r.data[i+1:]...)
			break
		}
	}
	r.data = append(r.data, p.Clone())
	return nil
}

func (r *Plugin) Remove(ctx context.Context, id id.PluginID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for i := 0; i < len(r.data); i++ {
		if p := r.data[i]; p.ID().Equal(id) {
			if s := p.ID().Scene(); s == nil || r.f.CanWrite(*s) {
				r.data = append(r.data[:i], r.data[i+1:]...)
				i--
			}
		}
	}

	return nil
}
