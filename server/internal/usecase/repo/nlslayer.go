package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
)

type NLSLayer interface {
	Filtered(SceneFilter) NLSLayer
	FindByID(context.Context, id.NLSLayerID) (nlslayer.NLSLayer, error)
	FindByIDs(context.Context, id.NLSLayerIDList) (nlslayer.NLSLayerList, error)
	FindNLSLayerSimpleByID(context.Context, id.NLSLayerID) (*nlslayer.NLSLayerSimple, error)
	FindNLSLayerSimpleByIDs(context.Context, id.NLSLayerIDList) (nlslayer.NLSLayerSimpleList, error)
	FindNLSLayerGroupByID(context.Context, id.NLSLayerID) (*nlslayer.NLSLayerGroup, error)
	FindNLSLayerGroupByIDs(context.Context, id.NLSLayerIDList) (nlslayer.NLSLayerGroupList, error)
	FindParentByID(context.Context, id.NLSLayerID) (*nlslayer.NLSLayerGroup, error)
	FindParentsByIDs(context.Context, id.NLSLayerIDList) (nlslayer.NLSLayerGroupList, error)
	FindByScene(context.Context, id.SceneID) (nlslayer.NLSLayerList, error)
	Save(context.Context, nlslayer.NLSLayer) error
	SaveAll(context.Context, nlslayer.NLSLayerList) error
	Remove(context.Context, id.NLSLayerID) error
	RemoveAll(context.Context, id.NLSLayerIDList) error
	RemoveByScene(context.Context, id.SceneID) error
}

func NLSLayerLoaderFrom(r NLSLayer) nlslayer.Loader {
	return func(ctx context.Context, ids ...id.NLSLayerID) (nlslayer.NLSLayerList, error) {
		return r.FindByIDs(ctx, ids)
	}
}

func NLSLayerLoaderBySceneFrom(r NLSLayer) nlslayer.LoaderByScene {
	return func(ctx context.Context, s id.SceneID) (nlslayer.NLSLayerList, error) {
		return r.FindByScene(ctx, s)
	}
}
