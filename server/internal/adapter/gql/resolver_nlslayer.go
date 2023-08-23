package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) NLSLayerSimple() NLSLayerSimpleResolver {
	return &nlsLayerSimpleResolver{r}
}

type nlsLayerSimpleResolver struct{ *Resolver }

func (r *nlsLayerSimpleResolver) Scene(ctx context.Context, obj *gqlmodel.NLSLayerSimple) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *Resolver) NLSLayerGroup() NLSLayerGroupResolver {
	return &nlsLayerGroupResolver{r}
}

type nlsLayerGroupResolver struct{ *Resolver }

func (r *nlsLayerGroupResolver) Scene(ctx context.Context, obj *gqlmodel.NLSLayerGroup) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}
