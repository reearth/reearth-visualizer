package adapter

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/rerror"
)

// TODO: ここで幅優先探索していくアルゴリズムを書いてmongoからビルトインの検索ロジックを除去する
type propertySchema struct {
	readers []repo.PropertySchema
	writer  repo.PropertySchema
}

// NewPropertySchema generates a new repository which has fallback repositories to be used when the property schema is not found
func NewPropertySchema(readers []repo.PropertySchema, writer repo.PropertySchema) repo.PropertySchema {
	return &propertySchema{
		readers: append([]repo.PropertySchema{}, readers...),
		writer:  writer,
	}
}

func (r *propertySchema) Filtered(f repo.SceneFilter) repo.PropertySchema {
	readers := make([]repo.PropertySchema, 0, len(r.readers))
	for _, r := range r.readers {
		readers = append(readers, r.Filtered(f))
	}
	return &propertySchema{
		readers: readers,
		writer:  r.writer.Filtered(f),
	}
}

func (r *propertySchema) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	for _, re := range r.readers {
		if res, err := re.FindByID(ctx, id); err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				continue
			} else {
				return nil, err
			}
		} else {
			return res, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *propertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	results := make(property.SchemaList, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil && err != rerror.ErrNotFound {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *propertySchema) Save(ctx context.Context, p *property.Schema) error {
	if r.writer == nil {
		return rerror.ErrInternalByWithContext(ctx, errors.New("writer is not set"))
	}
	return r.writer.Save(ctx, p)
}

func (r *propertySchema) SaveAll(ctx context.Context, p property.SchemaList) error {
	if r.writer == nil {
		return rerror.ErrInternalByWithContext(ctx, errors.New("writer is not set"))
	}
	return r.writer.SaveAll(ctx, p)
}

func (r *propertySchema) Remove(ctx context.Context, p id.PropertySchemaID) error {
	if r.writer == nil {
		return rerror.ErrInternalByWithContext(ctx, errors.New("writer is not set"))
	}
	return r.writer.Remove(ctx, p)
}

func (r *propertySchema) RemoveAll(ctx context.Context, p []id.PropertySchemaID) error {
	if r.writer == nil {
		return rerror.ErrInternalByWithContext(ctx, errors.New("writer is not set"))
	}
	return r.writer.RemoveAll(ctx, p)
}
