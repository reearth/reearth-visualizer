package memory

import (
	"context"
	"errors"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearthx/rerror"
)

type Plugin struct {
	lock sync.Mutex
	data []*plugin.Plugin
	f    repo.SceneFilter
}

func NewPlugin() *Plugin {
	return &Plugin{
		data: []*plugin.Plugin{},
	}
}

func NewPluginWith(items ...*plugin.Plugin) *Plugin {
	r := NewPlugin()
	ctx := context.Background()
	for _, i := range items {
		_ = r.Save(ctx, i)
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

func (r *Plugin) RemoveBySceneWithFile(cts context.Context, sid id.SceneID, f gateway.File) error {
	if !r.f.CanWrite(sid) {
		return nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	newData := make([]*plugin.Plugin, 0, len(r.data))
	for _, p := range r.data {
		if s := p.Scene(); s == nil || *s != sid {
			newData = append(newData, p)
		}
	}
	r.data = newData
	return nil
}
