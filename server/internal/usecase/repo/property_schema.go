package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
)

type PropertySchema interface {
	Filtered(SceneFilter) PropertySchema
	FindByID(context.Context, id.PropertySchemaID) (*property.Schema, error)
	FindByIDs(context.Context, []id.PropertySchemaID) (property.SchemaList, error)
	Save(context.Context, *property.Schema) error
	SaveAll(context.Context, property.SchemaList) error
	Remove(context.Context, id.PropertySchemaID) error
	RemoveAll(context.Context, []id.PropertySchemaID) error
}

func PropertySchemaLoaderFrom(r PropertySchema) property.SchemaLoader {
	return func(ctx context.Context, ids ...id.PropertySchemaID) (property.SchemaList, error) {
		return r.FindByIDs(ctx, ids)
	}
}
