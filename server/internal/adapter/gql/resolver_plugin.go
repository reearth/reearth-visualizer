package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"golang.org/x/text/language"
)

func (r *Resolver) Plugin() PluginResolver {
	return &pluginResolver{r}
}

func (r *Resolver) PluginExtension() PluginExtensionResolver {
	return &pluginExtensionResolver{r}
}

type pluginResolver struct{ *Resolver }

func (r *pluginResolver) PropertySchema(ctx context.Context, obj *gqlmodel.Plugin) (*gqlmodel.PropertySchema, error) {
	if obj.PropertySchemaID == nil {
		return nil, nil
	}
	return dataloaders(ctx).PropertySchema.Load(*obj.PropertySchemaID)
}

func (r *pluginResolver) Scene(ctx context.Context, obj *gqlmodel.Plugin) (*gqlmodel.Scene, error) {
	if obj.SceneID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Scene.Load(*obj.SceneID)
}

func (r *pluginResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.Plugin, sceneID *gqlmodel.ID) (*gqlmodel.ScenePlugin, error) {
	if sceneID == nil && obj.SceneID != nil {
		sceneID = obj.SceneID
	}
	if sceneID == nil {
		return nil, nil
	}
	s, err := dataloaders(ctx).Scene.Load(*sceneID)
	return s.Plugin(obj.ID), err
}

func (r *pluginResolver) TranslatedName(ctx context.Context, obj *gqlmodel.Plugin, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedName[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Name, nil
}

func (r *pluginResolver) TranslatedDescription(ctx context.Context, obj *gqlmodel.Plugin, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedDescription[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Description, nil
}

type pluginExtensionResolver struct{ *Resolver }

func (r *pluginExtensionResolver) Plugin(ctx context.Context, obj *gqlmodel.PluginExtension) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}

func (r *pluginExtensionResolver) PropertySchema(ctx context.Context, obj *gqlmodel.PluginExtension) (*gqlmodel.PropertySchema, error) {
	return dataloaders(ctx).PropertySchema.Load(obj.PropertySchemaID)
}

func (r *pluginExtensionResolver) SceneWidget(ctx context.Context, obj *gqlmodel.PluginExtension, sceneID gqlmodel.ID) (*gqlmodel.SceneWidget, error) {
	s, err := dataloaders(ctx).Scene.Load(sceneID)
	return s.Widget(obj.PluginID, obj.ExtensionID), err
}

func (r *pluginExtensionResolver) TranslatedName(ctx context.Context, obj *gqlmodel.PluginExtension, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedName[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Name, nil
}

func (r *pluginExtensionResolver) TranslatedDescription(ctx context.Context, obj *gqlmodel.PluginExtension, lang *language.Tag) (string, error) {
	if s, ok := obj.AllTranslatedDescription[getLang(ctx, lang)]; ok {
		return s, nil
	}
	return obj.Description, nil
}
