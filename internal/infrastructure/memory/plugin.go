package memory

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

type Plugin struct {
	data []*plugin.Plugin
}

func NewPlugin() repo.Plugin {
	return &Plugin{
		data: []*plugin.Plugin{},
	}
}

func (r *Plugin) FindByID(ctx context.Context, id id.PluginID) (*plugin.Plugin, error) {
	if p := builtin.GetPlugin(id); p != nil {
		return p, nil
	}
	for _, p := range r.data {
		if p.ID().Equal(id) {
			p2 := *p
			return &p2, nil
		}
	}
	return nil, err1.ErrNotFound
}

func (r *Plugin) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	result := []*plugin.Plugin{}
	for _, id := range ids {
		if p := builtin.GetPlugin(id); p != nil {
			result = append(result, p)
			continue
		}
		for _, p := range r.data {
			if p.ID().Equal(id) {
				p2 := *p
				result = append(result, &p2)
			} else {
				result = append(result, nil)
			}
		}
	}
	return result, nil
}

func (r *Plugin) Save(ctx context.Context, p *plugin.Plugin) error {
	if p.ID().System() {
		return errors.New("cannnot save system plugin")
	}
	for _, p := range r.data {
		if p.ID().Equal(p.ID()) {
			return nil
		}
	}
	p2 := *p
	r.data = append(r.data, &p2)
	return nil
}
