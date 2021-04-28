package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
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

type sceneResolver struct{ *Resolver }

func (r *sceneResolver) Project(ctx context.Context, obj *graphql1.Scene) (*graphql1.Project, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Project.Load(id.ProjectID(obj.ProjectID))
}

func (r *sceneResolver) Team(ctx context.Context, obj *graphql1.Scene) (*graphql1.Team, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Team.Load(id.TeamID(obj.TeamID))
}

func (r *sceneResolver) Property(ctx context.Context, obj *graphql1.Scene) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

func (r *sceneResolver) RootLayer(ctx context.Context, obj *graphql1.Scene) (*graphql1.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := dataloader.DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.RootLayerID))
	if err != nil {
		return nil, err
	}
	if layer == nil {
		return nil, nil
	}
	layerGroup, ok := (*layer).(*graphql1.LayerGroup)
	if !ok {
		return nil, nil
	}
	return layerGroup, nil
}

func (r *sceneResolver) DatasetSchemas(ctx context.Context, obj *graphql1.Scene, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*graphql1.DatasetSchemaConnection, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.DatasetController.FindSchemaByScene(ctx, obj.ID, first, last, before, after, getOperator(ctx))
}

func (r *sceneResolver) LockMode(ctx context.Context, obj *graphql1.Scene) (graphql1.SceneLockMode, error) {
	exit := trace(ctx)
	defer exit()

	sl, err := r.config.Controllers.SceneController.FetchLock(ctx, id.SceneID(obj.ID), getOperator(ctx))
	if err != nil {
		return graphql1.SceneLockModeFree, err
	}
	return *sl, nil
}

type scenePluginResolver struct{ *Resolver }

func (r *scenePluginResolver) Plugin(ctx context.Context, obj *graphql1.ScenePlugin) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}
func (r *scenePluginResolver) Property(ctx context.Context, obj *graphql1.ScenePlugin) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PropertyID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.PropertyID))
}

type sceneWidgetResolver struct{ *Resolver }

func (r *sceneWidgetResolver) Plugin(ctx context.Context, obj *graphql1.SceneWidget) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}

func (r *sceneWidgetResolver) Extension(ctx context.Context, obj *graphql1.SceneWidget) (*graphql1.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	plugin, err := dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
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

func (r *sceneWidgetResolver) Property(ctx context.Context, obj *graphql1.SceneWidget) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}
