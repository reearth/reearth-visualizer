package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) NLSLayerSimple() NLSLayerSimpleResolver {
	return &nlsLayerSimpleResolver{r}
}

func (r *Resolver) NLSInfobox() NLSInfoboxResolver {
	return &nlsInfoboxResolver{r}
}

func (r *Resolver) InfoboxBlock() InfoboxBlockResolver {
	return &infoboxBlockResolver{r}
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

type nlsInfoboxResolver struct{ *Resolver }

func (r *nlsInfoboxResolver) Scene(ctx context.Context, obj *gqlmodel.NLSInfobox) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *nlsInfoboxResolver) Property(ctx context.Context, obj *gqlmodel.NLSInfobox) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

type infoboxBlockResolver struct{ *Resolver }

func (r *infoboxBlockResolver) Scene(ctx context.Context, obj *gqlmodel.InfoboxBlock) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (s *infoboxBlockResolver) Property(ctx context.Context, obj *gqlmodel.InfoboxBlock) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (s *infoboxBlockResolver) Plugin(ctx context.Context, obj *gqlmodel.InfoboxBlock) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}
