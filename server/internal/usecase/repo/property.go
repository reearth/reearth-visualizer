package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
)

type Property interface {
	Filtered(SceneFilter) Property
	FindByID(context.Context, id.PropertyID) (*property.Property, error)
	FindByIDs(context.Context, id.PropertyIDList) (property.List, error)
	FindLinkedAll(context.Context, id.SceneID) (property.List, error)
	FindByDataset(context.Context, id.DatasetSchemaID, id.DatasetID) (property.List, error)
	FindBySchema(context.Context, []id.PropertySchemaID, id.SceneID) (property.List, error)
	FindByPlugin(context.Context, id.PluginID, id.SceneID) (property.List, error)
	Save(context.Context, *property.Property) error
	SaveAll(context.Context, property.List) error
	UpdateSchemaPlugin(context.Context, id.PluginID, id.PluginID, id.SceneID) error
	Remove(context.Context, id.PropertyID) error
	RemoveAll(context.Context, id.PropertyIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}

func PropertyLoaderFrom(r Property) property.Loader {
	return func(ctx context.Context, ids ...id.PropertyID) (property.List, error) {
		return r.FindByIDs(ctx, ids)
	}
}
