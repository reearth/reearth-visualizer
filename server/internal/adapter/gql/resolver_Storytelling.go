package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
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
