package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (r *Resolver) Story() StoryResolver {
	return &storyResolver{r}
}

type storyResolver struct{ *Resolver }

func (r *storyResolver) Scene(ctx context.Context, obj *gqlmodel.Story) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *storyResolver) Property(ctx context.Context, obj *gqlmodel.Story) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (r *Resolver) StoryPage() StoryPageResolver {
	return &storyPageResolver{r}
}

type storyPageResolver struct{ *Resolver }

func (s storyPageResolver) Layers(ctx context.Context, obj *gqlmodel.StoryPage) ([]gqlmodel.Layer, error) {
	layers, err := dataloaders(ctx).Layer.LoadAll(obj.LayersIds)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return lo.Map(layers, func(l *gqlmodel.Layer, _ int) gqlmodel.Layer {
		if l == nil {
			return nil
		}
		return *l
	}), nil
}

func (s storyPageResolver) SwipeableLayers(ctx context.Context, obj *gqlmodel.StoryPage) ([]gqlmodel.Layer, error) {
	layers, err := dataloaders(ctx).Layer.LoadAll(obj.SwipeableLayersIds)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return lo.Map(layers, func(l *gqlmodel.Layer, _ int) gqlmodel.Layer {
		if l == nil {
			return nil
		}
		return *l
	}), nil
}

func (s storyPageResolver) Property(ctx context.Context, obj *gqlmodel.StoryPage) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (s storyPageResolver) Scene(ctx context.Context, obj *gqlmodel.StoryPage) (*gqlmodel.Scene, error) {
	scene, err := loaders(ctx).Scene.Fetch(ctx, []gqlmodel.ID{obj.SceneID})
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	if len(scene) == 0 {
		return nil, rerror.ErrNotFound
	}
	return scene[0], nil
}

func (r *Resolver) StoryBlock() StoryBlockResolver {
	return &storyBlockResolver{r}
}

type storyBlockResolver struct{ *Resolver }

func (s storyBlockResolver) Property(ctx context.Context, obj *gqlmodel.StoryBlock) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (s storyBlockResolver) Plugin(ctx context.Context, obj *gqlmodel.StoryBlock) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}
