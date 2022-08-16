package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) LayerItem() LayerItemResolver {
	return &layerItemResolver{r}
}

func (r *Resolver) LayerGroup() LayerGroupResolver {
	return &layerGroupResolver{r}
}

func (r *Resolver) Infobox() InfoboxResolver {
	return &infoboxResolver{r}
}

func (r *Resolver) InfoboxField() InfoboxFieldResolver {
	return &infoboxFieldResolver{r}
}

func (r *Resolver) MergedLayer() MergedLayerResolver {
	return &mergedLayerResolver{r}
}

func (r *Resolver) MergedInfobox() MergedInfoboxResolver {
	return &mergedInfoboxResolver{r}
}

func (r *Resolver) MergedInfoboxField() MergedInfoboxFieldResolver {
	return &mergedInfoboxFieldResolver{r}
}

func (r *Resolver) LayerTagItem() LayerTagItemResolver {
	return &layerTagItemResolver{r}
}

func (r *Resolver) LayerTagGroup() LayerTagGroupResolver {
	return &layerTagGroupResolver{r}
}

type infoboxResolver struct{ *Resolver }

func (r *infoboxResolver) Property(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (r *infoboxResolver) Layer(ctx context.Context, obj *gqlmodel.Infobox) (gqlmodel.Layer, error) {
	layer, err := dataloaders(ctx).Layer.Load(obj.LayerID)
	if err != nil || layer == nil {
		return nil, err
	}
	return *layer, nil
}

func (r *infoboxResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.Dataset, error) {
	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Dataset.Load(*obj.LinkedDatasetID)
}

func (r *infoboxResolver) Merged(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.MergedInfobox, error) {
	ml, err := loaders(ctx).Layer.FetchParentAndMerged(ctx, obj.LayerID)
	if err != nil || ml == nil {
		return nil, err
	}
	return ml.Infobox, nil
}

func (r *infoboxResolver) Scene(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *infoboxResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.ScenePlugin, error) {
	layer, err := dataloaders(ctx).Layer.Load(obj.LayerID)
	if err != nil || layer == nil {
		return nil, err
	}

	var pluginID *gqlmodel.ID
	if lg, ok := (*layer).(*gqlmodel.LayerGroup); ok {
		pluginID = lg.PluginID
	} else if li, ok := (*layer).(*gqlmodel.LayerItem); ok {
		pluginID = li.PluginID
	}
	if pluginID == nil {
		return nil, nil
	}

	s, err := dataloaders(ctx).Scene.Load(obj.SceneID)
	if err != nil {
		return nil, err
	}
	return s.Plugin(*pluginID), nil
}

type infoboxFieldResolver struct{ *Resolver }

func (r *infoboxFieldResolver) Layer(ctx context.Context, obj *gqlmodel.InfoboxField) (gqlmodel.Layer, error) {
	layer, err := dataloaders(ctx).Layer.Load(obj.LayerID)
	if err != nil {
		return nil, err
	}
	return *layer, nil
}

func (r *infoboxFieldResolver) Infobox(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Infobox, error) {
	layer, err := dataloaders(ctx).Layer.Load(obj.LayerID)
	if err != nil || layer == nil {
		return nil, err
	}
	layer2 := (*layer).(*gqlmodel.LayerItem)
	if layer2 == nil {
		return nil, nil
	}
	return layer2.Infobox, nil
}

func (r *infoboxFieldResolver) Property(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Property, error) {
	return dataloaders(ctx).Property.Load(obj.PropertyID)
}

func (r *infoboxFieldResolver) Plugin(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}

func (r *infoboxFieldResolver) Extension(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.PluginExtension, error) {
	plugin, err := dataloaders(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(obj.ExtensionID), nil
}

func (r *infoboxFieldResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Dataset, error) {
	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Dataset.Load(*obj.LinkedDatasetID)
}

func (r *infoboxFieldResolver) Merged(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.MergedInfoboxField, error) {
	ml, err := loaders(ctx).Layer.FetchParentAndMerged(ctx, obj.LayerID)
	if err != nil || ml == nil || ml.Infobox == nil {
		return nil, err
	}
	return ml.Infobox.Field(obj.ID), nil
}

func (r *infoboxFieldResolver) Scene(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *infoboxFieldResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.ScenePlugin, error) {
	s, err := dataloaders(ctx).Scene.Load(obj.SceneID)
	if err != nil {
		return nil, err
	}
	return s.Plugin(obj.PluginID), nil
}

type layerGroupResolver struct{ *Resolver }

func (r *layerGroupResolver) Parent(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.LayerGroup, error) {
	if obj.ParentID != nil {
		return dataloaders(ctx).LayerGroup.Load(*obj.ParentID)
	}
	return loaders(ctx).Layer.FetchParent(ctx, obj.ID)
}

func (r *layerGroupResolver) Property(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.Property, error) {
	if obj.PropertyID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(*obj.PropertyID)
}

func (r *layerGroupResolver) Plugin(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.Plugin, error) {
	if obj.PluginID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Plugin.Load(*obj.PluginID)
}

func (r *layerGroupResolver) Extension(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.PluginExtension, error) {
	if obj.PluginID == nil || obj.ExtensionID == nil {
		return nil, nil
	}
	plugin, err := dataloaders(ctx).Plugin.Load(*obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(*obj.ExtensionID), nil
}

func (r *layerGroupResolver) ParentLayer(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.LayerGroup, error) {
	return loaders(ctx).Layer.FetchParent(ctx, obj.ID)
}

func (r *layerGroupResolver) LinkedDatasetSchema(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.DatasetSchema, error) {
	if obj.LinkedDatasetSchemaID == nil {
		return nil, nil
	}
	return dataloaders(ctx).DatasetSchema.Load(*obj.LinkedDatasetSchemaID)
}

func (r *layerGroupResolver) Layers(ctx context.Context, obj *gqlmodel.LayerGroup) ([]gqlmodel.Layer, error) {
	layers, err := dataloaders(ctx).Layer.LoadAll(obj.LayerIds)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return gqlmodel.AttachParentLayer(layers, obj.ID), nil
}

func (r *layerGroupResolver) Scene(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *layerGroupResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.ScenePlugin, error) {
	if obj.PluginID == nil {
		return nil, nil
	}
	s, err := dataloaders(ctx).Scene.Load(obj.SceneID)
	if err != nil {
		return nil, err
	}
	return s.Plugin(*obj.PluginID), nil
}

type layerItemResolver struct{ *Resolver }

func (r *layerItemResolver) Parent(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.LayerGroup, error) {
	if obj.ParentID != nil {
		return dataloaders(ctx).LayerGroup.Load(*obj.ParentID)
	}
	return loaders(ctx).Layer.FetchParent(ctx, obj.ID)
}

func (r *layerItemResolver) Property(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Property, error) {
	if obj.PropertyID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Property.Load(*obj.PropertyID)
}

func (r *layerItemResolver) Plugin(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Plugin, error) {
	if obj.PluginID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Plugin.Load(*obj.PluginID)
}

func (r *layerItemResolver) Extension(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.PluginExtension, error) {
	if obj.PluginID == nil || obj.ExtensionID == nil {
		return nil, nil
	}
	plugin, err := dataloaders(ctx).Plugin.Load(*obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(*obj.ExtensionID), nil
}

func (r *layerItemResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Dataset, error) {
	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Dataset.Load(*obj.LinkedDatasetID)
}

func (r *layerItemResolver) Merged(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.MergedLayer, error) {
	if obj.ParentID == nil {
		return loaders(ctx).Layer.FetchParentAndMerged(ctx, obj.ID)
	}
	return loaders(ctx).Layer.FetchMerged(ctx, obj.ID, obj.ParentID)
}

func (r *layerItemResolver) Scene(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *layerItemResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.ScenePlugin, error) {
	if obj.PluginID == nil {
		return nil, nil
	}
	s, err := dataloaders(ctx).Scene.Load(obj.SceneID)
	if err != nil {
		return nil, err
	}
	return s.Plugin(*obj.PluginID), nil
}

type mergedLayerResolver struct{ *Resolver }

func (r *mergedLayerResolver) Original(ctx context.Context, obj *gqlmodel.MergedLayer) (*gqlmodel.LayerItem, error) {
	return dataloaders(ctx).LayerItem.Load(obj.OriginalID)
}

func (r *mergedLayerResolver) Parent(ctx context.Context, obj *gqlmodel.MergedLayer) (*gqlmodel.LayerGroup, error) {
	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloaders(ctx).LayerGroup.Load(*obj.ParentID)
}

func (r *mergedLayerResolver) Scene(ctx context.Context, obj *gqlmodel.MergedLayer) (*gqlmodel.Scene, error) {
	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

type mergedInfoboxResolver struct{ *Resolver }

func (r *mergedInfoboxResolver) Scene(ctx context.Context, obj *gqlmodel.MergedInfobox) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

type mergedInfoboxFieldResolver struct{ *Resolver }

func (r *mergedInfoboxFieldResolver) Plugin(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.Plugin, error) {
	return dataloaders(ctx).Plugin.Load(obj.PluginID)
}

func (r *mergedInfoboxFieldResolver) Extension(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.PluginExtension, error) {
	plugin, err := dataloaders(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(obj.ExtensionID), nil
}

func (r *mergedInfoboxFieldResolver) Scene(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.Scene, error) {
	return dataloaders(ctx).Scene.Load(obj.SceneID)
}

func (r *mergedInfoboxFieldResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.ScenePlugin, error) {
	s, err := dataloaders(ctx).Scene.Load(obj.SceneID)
	if err != nil {
		return nil, err
	}
	return s.Plugin(obj.PluginID), nil
}

type layerTagItemResolver struct{ *Resolver }

func (r *layerTagItemResolver) Tag(ctx context.Context, obj *gqlmodel.LayerTagItem) (gqlmodel.Tag, error) {
	t, err := dataloaders(ctx).Tag.Load(obj.TagID)
	if err != nil {
		return nil, err
	}
	return *t, nil
}

type layerTagGroupResolver struct{ *Resolver }

func (r *layerTagGroupResolver) Tag(ctx context.Context, obj *gqlmodel.LayerTagGroup) (gqlmodel.Tag, error) {
	t, err := dataloaders(ctx).Tag.Load(obj.TagID)
	if err != nil {
		return nil, err
	}
	return *t, nil
}
