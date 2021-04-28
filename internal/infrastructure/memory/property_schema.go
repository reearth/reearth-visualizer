package memory

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

type PropertySchema struct {
	data map[id.PropertySchemaID]property.Schema
}

func NewPropertySchema() repo.PropertySchema {
	return &PropertySchema{
		data: map[id.PropertySchemaID]property.Schema{},
	}
}

func (r *PropertySchema) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	if ps := builtin.GetPropertySchema(id); ps != nil {
		return ps, nil
	}
	p, ok := r.data[id]
	if ok {
		return &p, nil
	}
	return nil, err1.ErrNotFound
}

func (r *PropertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
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
	if p.ID().System() {
		return errors.New("cannnot save system property schema")
	}
	r.data[p.ID()] = *p
	return nil
}

func (r *PropertySchema) SaveAll(ctx context.Context, p property.SchemaList) error {
	for _, ps := range p {
		if err := r.Save(ctx, ps); err != nil {
			return err
		}
	}
	return nil
}
