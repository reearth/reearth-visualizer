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
	data map[id.PropertySchemaID]property.Schema
}

func NewPropertySchema() repo.PropertySchema {
	return &PropertySchema{
		data: map[id.PropertySchemaID]property.Schema{},
	}
}

func (r *PropertySchema) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if ps := builtin.GetPropertySchema(id); ps != nil {
		return ps, nil
	}
	p, ok := r.data[id]
	if ok {
		return &p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *PropertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := property.SchemaList{}
	for _, id := range ids {
		if ps := builtin.GetPropertySchema(id); ps != nil {
			result = append(result, ps)
			continue
		}
		if d, ok := r.data[id]; ok {
			result = append(result, &d)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *PropertySchema) Save(ctx context.Context, p *property.Schema) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p.ID().System() {
		return errors.New("cannnot save system property schema")
	}
	r.data[p.ID()] = *p
	return nil
}

func (r *PropertySchema) SaveAll(ctx context.Context, p property.SchemaList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, ps := range p {
		if err := r.Save(ctx, ps); err != nil {
			return err
		}
	}
	return nil
}
