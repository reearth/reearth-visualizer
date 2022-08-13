package fs

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/spf13/afero"
)

type propertySchema struct {
	fs afero.Fs
	f  repo.SceneFilter
}

func NewPropertySchema(fs afero.Fs) repo.PropertySchema {
	return &propertySchema{
		fs: fs,
	}
}

func (r *propertySchema) Filtered(f repo.SceneFilter) repo.PropertySchema {
	return &propertySchema{
		fs: r.fs,
		f:  r.f.Merge(f),
	}
}

func (r *propertySchema) FindByID(ctx context.Context, i id.PropertySchemaID) (*property.Schema, error) {
	m, err := readPluginManifest(r.fs, i.Plugin())
	if err != nil {
		return nil, err
	}

	if m.Schema != nil && m.Schema.ID() == i {
		return m.Schema, nil
	}

	for _, ps := range m.ExtensionSchema {
		if ps == nil {
			continue
		}
		if ps.ID().Equal(i) {
			if s := ps.Scene(); s == nil || r.f.CanRead(*s) {
				return ps, nil
			}
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *propertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	results := make(property.SchemaList, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *propertySchema) Save(ctx context.Context, p *property.Schema) error {
	return rerror.ErrInternalBy(errors.New("read only"))
}

func (r *propertySchema) SaveAll(ctx context.Context, p property.SchemaList) error {
	return rerror.ErrInternalBy(errors.New("read only"))
}

func (r *propertySchema) Remove(ctx context.Context, pid id.PropertySchemaID) error {
	return rerror.ErrInternalBy(errors.New("read only"))
}

func (r *propertySchema) RemoveAll(ctx context.Context, pid []id.PropertySchemaID) error {
	return rerror.ErrInternalBy(errors.New("read only"))
}
