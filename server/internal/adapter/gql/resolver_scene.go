package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/pkg/id"
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

	nlslayers, err := usecases(ctx).NLSLayer.FetchByScene(ctx, sid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	res := gqlmodel.ToNLSLayers(nlslayers, nil)
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
