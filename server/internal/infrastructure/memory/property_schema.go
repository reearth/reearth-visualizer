package memory

import (
	"context"
	"errors"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type PropertySchema struct {
	lock sync.Mutex
	data map[string]*property.Schema
	f    repo.SceneFilter
}

func NewPropertySchema() repo.PropertySchema {
	return &PropertySchema{}
}

func NewPropertySchemaWith(items ...*property.Schema) repo.PropertySchema {
	r := NewPropertySchema()
	for _, i := range items {
		_ = r.Save(nil, i)
	}
	return r
}

func (r *PropertySchema) initMap() {
	if r.data == nil {
		r.data = map[string]*property.Schema{}
	}
}

func (r *PropertySchema) Filtered(f repo.SceneFilter) repo.PropertySchema {
	return &PropertySchema{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *PropertySchema) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if ps := builtin.GetPropertySchema(id); ps != nil {
		return ps, nil
	}

	r.initMap()
	p, ok := r.data[id.String()]
	if ok {
		if s := p.Scene(); s == nil || r.f.CanRead(*s) {
			return p, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *PropertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.initMap()
	result := property.SchemaList{}
	for _, id := range ids {
		if ps := builtin.GetPropertySchema(id); ps != nil {
			result = append(result, ps)
			continue
		}
		if d, ok := r.data[id.String()]; ok {
			if s := d.Scene(); s == nil || r.f.CanRead(*s) {
				result = append(result, d)
			}
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *PropertySchema) Save(ctx context.Context, p *property.Schema) error {
	if s := p.Scene(); s != nil && !r.f.CanWrite(*s) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.initMap()
	if p.ID().Plugin().System() {
		return errors.New("cannnot save system property schema")
	}
	r.data[p.ID().String()] = p
	return nil
}

func (r *PropertySchema) SaveAll(ctx context.Context, p property.SchemaList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.initMap()
	for _, p := range p {
		if p.ID().Plugin().System() {
			continue
		}
		if s := p.Scene(); s == nil || r.f.CanRead(*s) {
			r.data[p.ID().String()] = p
		}
	}
	return nil
}

func (r *PropertySchema) Remove(ctx context.Context, id id.PropertySchemaID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.initMap()

	if d, ok := r.data[id.String()]; ok {
		if s := d.Scene(); s == nil || r.f.CanRead(*s) {
			delete(r.data, id.String())
		}
	}

	return nil
}

func (r *PropertySchema) RemoveAll(ctx context.Context, ids []id.PropertySchemaID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.initMap()
	for _, id := range ids {
		if d, ok := r.data[id.String()]; ok {
			if s := d.Scene(); s == nil || r.f.CanRead(*s) {
				delete(r.data, id.String())
			}
		}
	}
	return nil
}
