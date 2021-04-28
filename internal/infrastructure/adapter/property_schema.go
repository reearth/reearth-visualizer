package adapter

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
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

func (r *propertySchema) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	for _, re := range r.readers {
		if res, err := re.FindByID(ctx, id); err != nil {
			if errors.Is(err, err1.ErrNotFound) {
				continue
			} else {
				return nil, err
			}
		} else {
			return res, nil
		}
	}
	return nil, err1.ErrNotFound
}

func (r *propertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	results := make(property.SchemaList, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil && err != err1.ErrNotFound {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *propertySchema) Save(ctx context.Context, p *property.Schema) error {
	if r.writer == nil {
		return err1.ErrInternalBy(errors.New("writer is not set"))
	}
	return r.writer.Save(ctx, p)
}

func (r *propertySchema) SaveAll(ctx context.Context, p property.SchemaList) error {
	if r.writer == nil {
		return err1.ErrInternalBy(errors.New("writer is not set"))
	}
	return r.writer.SaveAll(ctx, p)
}
