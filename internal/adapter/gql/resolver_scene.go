package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Scene() SceneResolver {
	return &sceneResolver{r}
}

func (r *Resolver) ScenePlugin() ScenePluginResolver {
	return &scenePluginResolver{r}
}

func (r *Resolver) SceneWidget() SceneWidgetResolver {
	return &sceneWidgetResolver{r}
}

func (r *Resolver) Cluster() ClusterResolver {
	return &clusterResolver{r}
}

type sceneResolver struct{ *Resolver }

func (r *sceneResolver) Project(ctx context.Context, obj *gqlmodel.Scene) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(id.ProjectID(obj.ProjectID))
}

func (r *sceneResolver) Team(ctx context.Context, obj *gqlmodel.Scene) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Team.Load(id.TeamID(obj.TeamID))
}

func (r *sceneResolver) Property(ctx context.Context, obj *gqlmodel.Scene) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

func (r *sceneResolver) RootLayer(ctx context.Context, obj *gqlmodel.Scene) (*gqlmodel.LayerGroup, error) {
	layer, err := dataloaders(ctx).Layer.Load(id.LayerID(obj.RootLayerID))
	if err != nil {
		return nil, err
	}
	if layer == nil {
		return nil, nil
	}
	layerGroup, ok := (*layer).(*gqlmodel.LayerGroup)
	if !ok {
		return nil, nil
	}
	return layerGroup, nil
}

func (r *sceneResolver) DatasetSchemas(ctx context.Context, obj *gqlmodel.Scene, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.DatasetSchemaConnection, error) {
	return loaders(ctx).Dataset.FindSchemaByScene(ctx, obj.ID, first, last, before, after)
}

func (r *sceneResolver) LockMode(ctx context.Context, obj *gqlmodel.Scene) (gqlmodel.SceneLockMode, error) {
	sl, err := loaders(ctx).Scene.FetchLock(ctx, id.SceneID(obj.ID))
	if err != nil {
		return gqlmodel.SceneLockModeFree, err
	}
	return *sl, nil
}

func (r *sceneResolver) Tags(ctx context.Context, obj *gqlmodel.Scene) ([]gqlmodel.Tag, error) {
	tags, err := usecases(ctx).Tag.FetchByScene(ctx, id.SceneID(obj.ID), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	res := make([]gqlmodel.Tag, 0, len(tags))
	for _, t := range tags {
		res = append(res, gqlmodel.ToTag(*t))
	}
	return res, nil
}

type scenePluginResolver struct{ *Resolver }

func (r *scenePluginResolver) Plugin(ctx context.Context, obj *gqlmodel.ScenePlugin) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}
func (r *scenePluginResolver) Property(ctx context.Context, obj *gqlmodel.ScenePlugin) (*gqlmodel.Property, error) {
	if obj.PropertyID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(id.PropertyID(*obj.PropertyID))
}

type sceneWidgetResolver struct{ *Resolver }

func (r *sceneWidgetResolver) Plugin(ctx context.Context, obj *gqlmodel.SceneWidget) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}

func (r *sceneWidgetResolver) Extension(ctx context.Context, obj *gqlmodel.SceneWidget) (*gqlmodel.PluginExtension, error) {
	plugin, err := dataloaders(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	for _, e := range plugin.Extensions {
		if e.ExtensionID == obj.ExtensionID {
			return e, nil
		}
	}
	return nil, nil
}

func (r *sceneWidgetResolver) Property(ctx context.Context, obj *gqlmodel.SceneWidget) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

type clusterResolver struct{ *Resolver }

func (r *clusterResolver) Property(ctx context.Context, obj *gqlmodel.Cluster) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}
