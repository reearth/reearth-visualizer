package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
)

type Layer interface {
	Filtered(SceneFilter) Layer
	FindByID(context.Context, id.LayerID) (layer.Layer, error)
	FindByIDs(context.Context, id.LayerIDList) (layer.List, error)
	FindItemByID(context.Context, id.LayerID) (*layer.Item, error)
	FindItemByIDs(context.Context, id.LayerIDList) (layer.ItemList, error)
	FindAllByDatasetSchema(context.Context, id.DatasetSchemaID) (layer.List, error)
	FindGroupByID(context.Context, id.LayerID) (*layer.Group, error)
	FindGroupByIDs(context.Context, id.LayerIDList) (layer.GroupList, error)
	FindGroupBySceneAndLinkedDatasetSchema(context.Context, id.SceneID, id.DatasetSchemaID) (layer.GroupList, error)
	FindParentByID(context.Context, id.LayerID) (*layer.Group, error)
	FindParentsByIDs(context.Context, id.LayerIDList) (layer.GroupList, error)
	FindByPluginAndExtension(context.Context, id.PluginID, *id.PluginExtensionID) (layer.List, error)
	FindByPluginAndExtensionOfBlocks(context.Context, id.PluginID, *id.PluginExtensionID) (layer.List, error)
	FindByProperty(context.Context, id.PropertyID) (layer.Layer, error)
	FindByScene(context.Context, id.SceneID) (layer.List, error)
	FindByTag(context.Context, id.TagID) (layer.List, error)
	CountByScene(context.Context, id.SceneID) (int, error)
	Save(context.Context, layer.Layer) error
	SaveAll(context.Context, layer.List) error
	UpdatePlugin(context.Context, id.PluginID, id.PluginID) error
	Remove(context.Context, id.LayerID) error
	RemoveAll(context.Context, id.LayerIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}

func LayerLoaderFrom(r Layer) layer.Loader {
	return func(ctx context.Context, ids ...id.LayerID) (layer.List, error) {
		return r.FindByIDs(ctx, ids)
	}
}

func LayerLoaderBySceneFrom(r Layer) layer.LoaderByScene {
	return func(ctx context.Context, s id.SceneID) (layer.List, error) {
		return r.FindByScene(ctx, s)
	}
}
