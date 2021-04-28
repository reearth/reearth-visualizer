package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
)

type Layer interface {
	FindByID(context.Context, id.LayerID, []id.SceneID) (layer.Layer, error)
	FindByIDs(context.Context, []id.LayerID, []id.SceneID) (layer.List, error)
	FindItemByID(context.Context, id.LayerID, []id.SceneID) (*layer.Item, error)
	FindItemByIDs(context.Context, []id.LayerID, []id.SceneID) (layer.ItemList, error)
	FindAllByDatasetSchema(context.Context, id.DatasetSchemaID) (layer.List, error)
	FindGroupByID(context.Context, id.LayerID, []id.SceneID) (*layer.Group, error)
	FindGroupByIDs(context.Context, []id.LayerID, []id.SceneID) (layer.GroupList, error)
	FindGroupBySceneAndLinkedDatasetSchema(context.Context, id.SceneID, id.DatasetSchemaID) (layer.GroupList, error)
	FindParentByID(context.Context, id.LayerID, []id.SceneID) (*layer.Group, error)
	FindByProperty(context.Context, id.PropertyID, []id.SceneID) (layer.Layer, error)
	FindByScene(context.Context, id.SceneID) (layer.List, error)
	Save(context.Context, layer.Layer) error
	SaveAll(context.Context, layer.List) error
	Remove(context.Context, id.LayerID) error
	RemoveAll(context.Context, []id.LayerID) error
	RemoveByScene(context.Context, id.SceneID) error
}

func LayerLoaderFrom(r Layer, scenes []id.SceneID) layer.Loader {
	return func(ctx context.Context, ids ...id.LayerID) (layer.List, error) {
		return r.FindByIDs(ctx, ids, scenes)
	}
}

func LayerLoaderBySceneFrom(r Layer) layer.LoaderByScene {
	return func(ctx context.Context, s id.SceneID) (layer.List, error) {
		return r.FindByScene(ctx, s)
	}
}
