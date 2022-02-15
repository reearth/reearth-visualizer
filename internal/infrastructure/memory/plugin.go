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
}

func NewPlugin() repo.Plugin {
	return &Plugin{
		data: []*plugin.Plugin{},
	}
}

func (r *Plugin) FindByID(ctx context.Context, id id.PluginID, sids []id.SceneID) (*plugin.Plugin, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p := builtin.GetPlugin(id); p != nil {
		return p, nil
	}
	for _, p := range r.data {
		if p.ID().Equal(id) && (p.ID().Scene() == nil || p.ID().Scene().Contains(sids)) {
			return p.Clone(), nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Plugin) FindByIDs(ctx context.Context, ids []id.PluginID, sids []id.SceneID) ([]*plugin.Plugin, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*plugin.Plugin{}
	for _, id := range ids {
		if p := builtin.GetPlugin(id); p != nil {
			result = append(result, p)
			continue
		}
		for _, p := range r.data {
			if p.ID().Equal(id) && (p.ID().Scene() == nil || p.ID().Scene().Contains(sids)) {
				result = append(result, p.Clone())
			} else {
				result = append(result, nil)
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
		if r.data[i].ID().Equal(id) {
			r.data = append(r.data[:i], r.data[i+1:]...)
			i--
		}
	}
	return nil
}
