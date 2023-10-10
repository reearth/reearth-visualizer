package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Style() StyleResolver {
	return &styleResolver{r}
}

type styleResolver struct{ *Resolver }

func (r *styleResolver) Scene(ctx context.Context, obj *gqlmodel.Style) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}
