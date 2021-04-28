package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (r *Resolver) Plugin() PluginResolver {
	return &pluginResolver{r}
}

func (r *Resolver) PluginExtension() PluginExtensionResolver {
	return &pluginExtensionResolver{r}
}

type pluginResolver struct{ *Resolver }

func (r *pluginResolver) PropertySchema(ctx context.Context, obj *graphql1.Plugin) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PropertySchemaID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(*obj.PropertySchemaID)
}

func (r *pluginResolver) ScenePlugin(ctx context.Context, obj *graphql1.Plugin, sceneID id.ID) (*graphql1.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(sceneID))
	return s.Plugin(obj.ID), err
}

func (r *pluginResolver) TranslatedName(ctx context.Context, obj *graphql1.Plugin, lang *string) (string, error) {
	if s, ok := obj.AllTranslatedName[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Name, nil
}

func (r *pluginResolver) TranslatedDescription(ctx context.Context, obj *graphql1.Plugin, lang *string) (string, error) {
	if s, ok := obj.AllTranslatedDescription[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Description, nil
}

type pluginExtensionResolver struct{ *Resolver }

func (r *pluginExtensionResolver) Plugin(ctx context.Context, obj *graphql1.PluginExtension) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}

func (r *pluginExtensionResolver) PropertySchema(ctx context.Context, obj *graphql1.PluginExtension) (*graphql1.PropertySchema, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).PropertySchema.Load(obj.PropertySchemaID)
}

func (r *pluginExtensionResolver) TranslatedName(ctx context.Context, obj *graphql1.PluginExtension, lang *string) (string, error) {
	if s, ok := obj.AllTranslatedName[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Name, nil
}

func (r *pluginExtensionResolver) SceneWidget(ctx context.Context, obj *graphql1.PluginExtension, sceneID id.ID) (*graphql1.SceneWidget, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(sceneID))
	return s.Widget(obj.PluginID, obj.ExtensionID), err
}

func (r *pluginExtensionResolver) TranslatedDescription(ctx context.Context, obj *graphql1.PluginExtension, lang *string) (string, error) {
	exit := trace(ctx)
	defer exit()

	if s, ok := obj.AllTranslatedDescription[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Description, nil
}
