package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
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
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (r *sceneResolver) Team(ctx context.Context, obj *gqlmodel.Scene) (*gqlmodel.Team, error) {
	return dataloaders(ctx).Workspace.Load(obj.TeamID)
}

func (r *sceneResolver) Property(ctx context.Context, obj *gqlmodel.Scene) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (r *sceneResolver) NewLayers(ctx context.Context, obj *gqlmodel.Scene) ([]gqlmodel.NLSLayer, error) {
	sid, err := gqlmodel.ToID[id.Scene](obj.ID)
	if err != nil {
		return nil, err
	}

	nlslayer, err := usecases(ctx).NLSLayer.FetchByScene(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	res := gqlmodel.ToNLSLayers(nlslayer, nil)
	return res, nil
}

func (r *sceneResolver) DatasetSchemas(ctx context.Context, obj *gqlmodel.Scene, first *int, last *int, after *usecasex.Cursor, before *usecasex.Cursor) (*gqlmodel.DatasetSchemaConnection, error) {
	return loaders(ctx).Dataset.FindSchemaByScene(ctx, obj.ID, first, last, before, after)
}

func (r *sceneResolver) Tags(ctx context.Context, obj *gqlmodel.Scene) ([]gqlmodel.Tag, error) {
	sid, err := gqlmodel.ToID[id.Scene](obj.ID)
	if err != nil {
		return nil, err
	}

	tags, err := usecases(ctx).Tag.FetchByScene(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	res := make([]gqlmodel.Tag, 0, len(tags))
	for _, t := range tags {
		res = append(res, gqlmodel.ToTag(*t))
	}
	return res, nil
}

func (r *sceneResolver) Stories(ctx context.Context, obj *gqlmodel.Scene) ([]*gqlmodel.Story, error) {
	sid, err := gqlmodel.ToID[id.Scene](obj.ID)
	if err != nil {
		return nil, err
	}

	stories, err := usecases(ctx).StoryTelling.FetchByScene(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	res := gqlmodel.ToStories(*stories)
	return res, nil
}

func (r *sceneResolver) Styles(ctx context.Context, obj *gqlmodel.Scene) ([]*gqlmodel.Style, error) {
	sid, err := gqlmodel.ToID[id.Scene](obj.ID)
	if err != nil {
		return nil, err
	}

	styles, err := usecases(ctx).Style.FetchByScene(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	res := gqlmodel.ToStyles(*styles)
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
	return dataloaders(ctx).Property.Load(*obj.PropertyID)
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
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

type clusterResolver struct{ *Resolver }

func (r *clusterResolver) Property(ctx context.Context, obj *gqlmodel.Cluster) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}
