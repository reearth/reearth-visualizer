package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-backend/pkg/id"
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
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

func (r *infoboxResolver) Layer(ctx context.Context, obj *gqlmodel.Infobox) (gqlmodel.Layer, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil || layer == nil {
		return nil, err
	}
	return *layer, nil
}

func (r *infoboxResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *infoboxResolver) Merged(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.MergedInfobox, error) {
	exit := trace(ctx)
	defer exit()

	ml, err := r.loaders.Layer.FetchParentAndMerged(ctx, id.LayerID(obj.LayerID))
	if err != nil || ml == nil {
		return nil, err
	}
	return ml.Infobox, nil
}

func (r *infoboxResolver) Scene(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *infoboxResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.Infobox) (*gqlmodel.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil || layer == nil {
		return nil, err
	}
	var pluginID *id.PluginID
	if lg, ok := (*layer).(*gqlmodel.LayerGroup); ok {
		pluginID = lg.PluginID
	} else if li, ok := (*layer).(*gqlmodel.LayerItem); ok {
		pluginID = li.PluginID
	}
	if pluginID == nil {
		return nil, nil
	}

	s, err := DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(*pluginID), nil
}

type infoboxFieldResolver struct{ *Resolver }

func (r *infoboxFieldResolver) Layer(ctx context.Context, obj *gqlmodel.InfoboxField) (gqlmodel.Layer, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil {
		return nil, err
	}
	return *layer, nil
}

func (r *infoboxFieldResolver) Infobox(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Infobox, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
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
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

func (r *infoboxFieldResolver) Plugin(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}

func (r *infoboxFieldResolver) Extension(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	plugin, err := DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(obj.ExtensionID), nil
}

func (r *infoboxFieldResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *infoboxFieldResolver) Merged(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.MergedInfoboxField, error) {
	exit := trace(ctx)
	defer exit()

	ml, err := r.loaders.Layer.FetchParentAndMerged(ctx, id.LayerID(obj.LayerID))
	if err != nil || ml == nil || ml.Infobox == nil {
		return nil, err
	}
	return ml.Infobox.Field(obj.ID), nil
}

func (r *infoboxFieldResolver) Scene(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *infoboxFieldResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.InfoboxField) (*gqlmodel.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	s, err := DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(obj.PluginID), nil
}

type layerGroupResolver struct{ *Resolver }

func (r *layerGroupResolver) Parent(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID != nil {
		return DataLoadersFromContext(ctx).LayerGroup.Load(id.LayerID(*obj.ParentID))
	}
	return r.loaders.Layer.FetchParent(ctx, id.LayerID(obj.ID))
}

func (r *layerGroupResolver) Property(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PropertyID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.PropertyID))
}

func (r *layerGroupResolver) Plugin(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
}

func (r *layerGroupResolver) Extension(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil || obj.ExtensionID == nil {
		return nil, nil
	}
	plugin, err := DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(*obj.ExtensionID), nil
}

func (r *layerGroupResolver) ParentLayer(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	return r.loaders.Layer.FetchParent(ctx, id.LayerID(obj.ID))
}

func (r *layerGroupResolver) LinkedDatasetSchema(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetSchemaID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(*obj.LinkedDatasetSchemaID))
}

func (r *layerGroupResolver) Layers(ctx context.Context, obj *gqlmodel.LayerGroup) ([]gqlmodel.Layer, error) {
	exit := trace(ctx)
	defer exit()

	layers, err := DataLoadersFromContext(ctx).Layer.LoadAll(id.LayerIDsFromIDRef(obj.LayerIds))
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return gqlmodel.AttachParentLayer(layers, obj.ID), nil
}

func (r *layerGroupResolver) Scene(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *layerGroupResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.LayerGroup) (*gqlmodel.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	s, err := DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(*obj.PluginID), nil
}

type layerItemResolver struct{ *Resolver }

func (r *layerItemResolver) Parent(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID != nil {
		return DataLoadersFromContext(ctx).LayerGroup.Load(id.LayerID(*obj.ParentID))
	}
	return r.loaders.Layer.FetchParent(ctx, id.LayerID(obj.ID))
}

func (r *layerItemResolver) Property(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PropertyID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.PropertyID))
}

func (r *layerItemResolver) Plugin(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
}

func (r *layerItemResolver) Extension(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil || obj.ExtensionID == nil {
		return nil, nil
	}
	plugin, err := DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(*obj.ExtensionID), nil
}

func (r *layerItemResolver) LinkedDataset(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *layerItemResolver) Merged(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.MergedLayer, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return r.loaders.Layer.FetchParentAndMerged(ctx, id.LayerID(obj.ID))
	}
	return r.loaders.Layer.FetchMerged(ctx, id.LayerID(obj.ID), id.LayerIDFromRefID(obj.ParentID))
}

func (r *layerItemResolver) Scene(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *layerItemResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.LayerItem) (*gqlmodel.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	s, err := DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(*obj.PluginID), nil
}

type mergedLayerResolver struct{ *Resolver }

func (r *mergedLayerResolver) Original(ctx context.Context, obj *gqlmodel.MergedLayer) (*gqlmodel.LayerItem, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).LayerItem.Load(id.LayerID(obj.OriginalID))
}

func (r *mergedLayerResolver) Parent(ctx context.Context, obj *gqlmodel.MergedLayer) (*gqlmodel.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).LayerGroup.Load(id.LayerID(*obj.ParentID))
}

func (r *mergedLayerResolver) Scene(ctx context.Context, obj *gqlmodel.MergedLayer) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return nil, nil
	}
	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

type mergedInfoboxResolver struct{ *Resolver }

func (r *mergedInfoboxResolver) Scene(ctx context.Context, obj *gqlmodel.MergedInfobox) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

type mergedInfoboxFieldResolver struct{ *Resolver }

func (r *mergedInfoboxFieldResolver) Plugin(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}

func (r *mergedInfoboxFieldResolver) Extension(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	plugin, err := DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(obj.ExtensionID), nil
}

func (r *mergedInfoboxFieldResolver) Scene(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *mergedInfoboxFieldResolver) ScenePlugin(ctx context.Context, obj *gqlmodel.MergedInfoboxField) (*gqlmodel.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	s, err := DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(obj.PluginID), nil
}

type layerTagItemResolver struct{ *Resolver }

func (r *layerTagItemResolver) Tag(ctx context.Context, obj *gqlmodel.LayerTagItem) (gqlmodel.Tag, error) {
	exit := trace(ctx)
	defer exit()

	t, err := DataLoadersFromContext(ctx).Tag.Load(id.TagID(obj.TagID))
	if err != nil {
		return nil, err
	}
	return *t, nil
}

type layerTagGroupResolver struct{ *Resolver }

func (r *layerTagGroupResolver) Tag(ctx context.Context, obj *gqlmodel.LayerTagGroup) (gqlmodel.Tag, error) {
	exit := trace(ctx)
	defer exit()

	t, err := DataLoadersFromContext(ctx).Tag.Load(id.TagID(obj.TagID))
	if err != nil {
		return nil, err
	}
	return *t, nil
}
