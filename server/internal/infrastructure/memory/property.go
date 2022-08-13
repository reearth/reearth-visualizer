package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

type Property struct {
	lock sync.Mutex
	data property.Map
	f    repo.SceneFilter
}

func NewProperty() repo.Property {
	return &Property{
		data: property.Map{},
	}
}

func NewPropertyWith(items ...*property.Property) repo.Property {
	r := NewProperty()
	for _, i := range items {
		_ = r.Save(nil, i)
	}
	return r
}

func (r *Property) Filtered(f repo.SceneFilter) repo.Property {
	return &Property{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Property) FindByID(ctx context.Context, id id.PropertyID) (*property.Property, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanRead(p.Scene()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Property) FindByIDs(ctx context.Context, ids id.PropertyIDList) (property.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := property.List{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Scene()) {
			result = append(result, d)
			continue
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Property) FindByDataset(ctx context.Context, sid id.DatasetSchemaID, did id.DatasetID) (property.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := property.List{}
	for _, p := range r.data {
		if p.IsDatasetLinked(sid, did) && r.f.CanRead(p.Scene()) {
			result = append(result, p)
		}
	}
	return result, nil
}

func (r *Property) FindLinkedAll(ctx context.Context, s id.SceneID) (property.List, error) {
	if !r.f.CanRead(s) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := property.List{}
	for _, p := range r.data {
		if p.Scene() == s && p.HasLinkedField() {
			result = append(result, p)
		}
	}
	return result, nil
}

func (r *Property) FindBySchema(_ context.Context, schemas []id.PropertySchemaID, scene id.SceneID) (property.List, error) {
	if !r.f.CanRead(scene) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := property.List{}
	for _, p := range r.data {
		if p.Scene() != scene {
			continue
		}
		for _, s := range schemas {
			if p.Schema().Equal(s) {
				result = append(result, p)
				break
			}
		}
	}
	result.Sort()
	return result, nil
}

func (r *Property) FindByPlugin(_ context.Context, plugin id.PluginID, scene id.SceneID) (property.List, error) {
	if !r.f.CanRead(scene) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := property.List{}
	for _, p := range r.data {
		if p.Scene() == scene && p.Schema().Plugin().Equal(plugin) {
			result = append(result, p)
			break
		}
	}
	result.Sort()
	return result, nil
}

func (r *Property) Save(ctx context.Context, p *property.Property) error {
	if !r.f.CanWrite(p.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[p.ID()] = p
	return nil
}

func (r *Property) SaveAll(ctx context.Context, pl property.List) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range pl {
		if r.f.CanWrite(p.Scene()) {
			r.data[p.ID()] = p
		}
	}
	return nil
}

func (r *Property) UpdateSchemaPlugin(ctx context.Context, old id.PluginID, new id.PluginID, scene id.SceneID) error {
	if !r.f.CanWrite(scene) {
		return nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range r.data {
		if s := p.Schema(); s.Plugin().Equal(old) && p.Scene() == scene {
			p.SetSchema(id.NewPropertySchemaID(new, s.ID()))
		}
	}
	return nil
}

func (r *Property) Remove(ctx context.Context, id id.PropertyID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanWrite(p.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *Property) RemoveAll(ctx context.Context, ids id.PropertyIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		if p, ok := r.data[id]; ok && r.f.CanWrite(p.Scene()) {
			delete(r.data, id)
		}
	}
	return nil
}

func (r *Property) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	for pid, p := range r.data {
		if p.Scene() == sceneID {
			delete(r.data, pid)
		}
	}
	return nil
}
