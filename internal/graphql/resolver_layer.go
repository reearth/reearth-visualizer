package graphql

import (
	"context"

	graphql1 "github.com/reearth/reearth-backend/internal/adapter/graphql"
	"github.com/reearth/reearth-backend/internal/graphql/dataloader"
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

type infoboxResolver struct{ *Resolver }

func (r *infoboxResolver) Property(ctx context.Context, obj *graphql1.Infobox) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

func (r *infoboxResolver) Layer(ctx context.Context, obj *graphql1.Infobox) (graphql1.Layer, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := dataloader.DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil || layer == nil {
		return nil, err
	}
	return *layer, nil
}

func (r *infoboxResolver) LinkedDataset(ctx context.Context, obj *graphql1.Infobox) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *infoboxResolver) Merged(ctx context.Context, obj *graphql1.Infobox) (*graphql1.MergedInfobox, error) {
	exit := trace(ctx)
	defer exit()

	ml, err := r.config.Controllers.LayerController.FetchParentAndMerged(ctx, id.LayerID(obj.LayerID), getOperator(ctx))
	if err != nil || ml == nil {
		return nil, err
	}
	return ml.Infobox, nil
}

func (r *infoboxResolver) Scene(ctx context.Context, obj *graphql1.Infobox) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *infoboxResolver) ScenePlugin(ctx context.Context, obj *graphql1.Infobox) (*graphql1.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := dataloader.DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil || layer == nil {
		return nil, err
	}
	var pluginID *id.PluginID
	if lg, ok := (*layer).(*graphql1.LayerGroup); ok {
		pluginID = lg.PluginID
	} else if li, ok := (*layer).(*graphql1.LayerItem); ok {
		pluginID = li.PluginID
	}
	if pluginID == nil {
		return nil, nil
	}

	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(*pluginID), nil
}

type infoboxFieldResolver struct{ *Resolver }

func (r *infoboxFieldResolver) Layer(ctx context.Context, obj *graphql1.InfoboxField) (graphql1.Layer, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := dataloader.DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil {
		return nil, err
	}
	return *layer, nil
}

func (r *infoboxFieldResolver) Infobox(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.Infobox, error) {
	exit := trace(ctx)
	defer exit()

	layer, err := dataloader.DataLoadersFromContext(ctx).Layer.Load(id.LayerID(obj.LayerID))
	if err != nil || layer == nil {
		return nil, err
	}
	layer2 := (*layer).(*graphql1.LayerItem)
	if layer2 == nil {
		return nil, nil
	}
	return layer2.Infobox, nil
}

func (r *infoboxFieldResolver) Property(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(obj.PropertyID))
}

func (r *infoboxFieldResolver) Plugin(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}

func (r *infoboxFieldResolver) Extension(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	plugin, err := dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(obj.ExtensionID), nil
}

func (r *infoboxFieldResolver) LinkedDataset(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *infoboxFieldResolver) Merged(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.MergedInfoboxField, error) {
	exit := trace(ctx)
	defer exit()

	ml, err := r.config.Controllers.LayerController.FetchParentAndMerged(ctx, id.LayerID(obj.LayerID), getOperator(ctx))
	if err != nil || ml == nil || ml.Infobox == nil {
		return nil, err
	}
	return ml.Infobox.Field(obj.ID), nil
}

func (r *infoboxFieldResolver) Scene(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *infoboxFieldResolver) ScenePlugin(ctx context.Context, obj *graphql1.InfoboxField) (*graphql1.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(obj.PluginID), nil
}

type layerGroupResolver struct{ *Resolver }

func (r *layerGroupResolver) Parent(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID != nil {
		return dataloader.DataLoadersFromContext(ctx).LayerGroup.Load(id.LayerID(*obj.ParentID))
	}
	return r.config.Controllers.LayerController.FetchParent(ctx, id.LayerID(obj.ID), getOperator(ctx))
}

func (r *layerGroupResolver) Property(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PropertyID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.PropertyID))
}

func (r *layerGroupResolver) Plugin(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
}

func (r *layerGroupResolver) Extension(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil || obj.ExtensionID == nil {
		return nil, nil
	}
	plugin, err := dataloader.DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(*obj.ExtensionID), nil
}

func (r *layerGroupResolver) ParentLayer(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	return r.config.Controllers.LayerController.FetchParent(ctx, id.LayerID(obj.ID), getOperator(ctx))
}

func (r *layerGroupResolver) LinkedDatasetSchema(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.DatasetSchema, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetSchemaID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).DatasetSchema.Load(id.DatasetSchemaID(*obj.LinkedDatasetSchemaID))
}

func (r *layerGroupResolver) Layers(ctx context.Context, obj *graphql1.LayerGroup) ([]graphql1.Layer, error) {
	exit := trace(ctx)
	defer exit()

	layers, err := dataloader.DataLoadersFromContext(ctx).Layer.LoadAll(id.LayerIDsFromIDRef(obj.LayerIds))
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return graphql1.AttachParentLayer(layers, obj.ID), nil
}

func (r *layerGroupResolver) Scene(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *layerGroupResolver) ScenePlugin(ctx context.Context, obj *graphql1.LayerGroup) (*graphql1.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(*obj.PluginID), nil
}

type layerItemResolver struct{ *Resolver }

func (r *layerItemResolver) Parent(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID != nil {
		return dataloader.DataLoadersFromContext(ctx).LayerGroup.Load(id.LayerID(*obj.ParentID))
	}
	return r.config.Controllers.LayerController.FetchParent(ctx, id.LayerID(obj.ID), getOperator(ctx))
}

func (r *layerItemResolver) Property(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.Property, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PropertyID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Property.Load(id.PropertyID(*obj.PropertyID))
}

func (r *layerItemResolver) Plugin(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
}

func (r *layerItemResolver) Extension(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil || obj.ExtensionID == nil {
		return nil, nil
	}
	plugin, err := dataloader.DataLoadersFromContext(ctx).Plugin.Load(*obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(*obj.ExtensionID), nil
}

func (r *layerItemResolver) LinkedDataset(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.Dataset, error) {
	exit := trace(ctx)
	defer exit()

	if obj.LinkedDatasetID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Dataset.Load(id.DatasetID(*obj.LinkedDatasetID))
}

func (r *layerItemResolver) Merged(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.MergedLayer, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return r.config.Controllers.LayerController.FetchParentAndMerged(ctx, id.LayerID(obj.ID), getOperator(ctx))
	}
	return r.config.Controllers.LayerController.FetchMerged(ctx, id.LayerID(obj.ID), id.LayerIDFromRefID(obj.ParentID), getOperator(ctx))
}

func (r *layerItemResolver) Scene(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *layerItemResolver) ScenePlugin(ctx context.Context, obj *graphql1.LayerItem) (*graphql1.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	if obj.PluginID == nil {
		return nil, nil
	}
	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(*obj.PluginID), nil
}

type mergedLayerResolver struct{ *Resolver }

func (r *mergedLayerResolver) Original(ctx context.Context, obj *graphql1.MergedLayer) (*graphql1.LayerItem, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).LayerItem.Load(id.LayerID(obj.OriginalID))
}

func (r *mergedLayerResolver) Parent(ctx context.Context, obj *graphql1.MergedLayer) (*graphql1.LayerGroup, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).LayerGroup.Load(id.LayerID(*obj.ParentID))
}

func (r *mergedLayerResolver) Scene(ctx context.Context, obj *graphql1.MergedLayer) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	if obj.ParentID == nil {
		return nil, nil
	}
	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

type mergedInfoboxResolver struct{ *Resolver }

func (r *mergedInfoboxResolver) Scene(ctx context.Context, obj *graphql1.MergedInfobox) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

type mergedInfoboxFieldResolver struct{ *Resolver }

func (r *mergedInfoboxFieldResolver) Plugin(ctx context.Context, obj *graphql1.MergedInfoboxField) (*graphql1.Plugin, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
}

func (r *mergedInfoboxFieldResolver) Extension(ctx context.Context, obj *graphql1.MergedInfoboxField) (*graphql1.PluginExtension, error) {
	exit := trace(ctx)
	defer exit()

	plugin, err := dataloader.DataLoadersFromContext(ctx).Plugin.Load(obj.PluginID)
	if err != nil {
		return nil, err
	}
	return plugin.Extension(obj.ExtensionID), nil
}

func (r *mergedInfoboxFieldResolver) Scene(ctx context.Context, obj *graphql1.MergedInfoboxField) (*graphql1.Scene, error) {
	exit := trace(ctx)
	defer exit()

	return dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
}

func (r *mergedInfoboxFieldResolver) ScenePlugin(ctx context.Context, obj *graphql1.MergedInfoboxField) (*graphql1.ScenePlugin, error) {
	exit := trace(ctx)
	defer exit()

	s, err := dataloader.DataLoadersFromContext(ctx).Scene.Load(id.SceneID(obj.SceneID))
	if err != nil {
		return nil, err
	}
	return s.Plugin(obj.PluginID), nil
}
