package layerops

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/layer"
)

type Processor struct {
	RootLayerID layer.ID
	LayerLoader layer.Loader
}

type UninstallPluginResult struct {
	ModifiedLayers    layer.List
	RemovedLayers     *layer.IDList
	RemovedProperties []layer.PropertyID
}

func (p Processor) UninstallPlugin(ctx context.Context, pluginID layer.PluginID) (res UninstallPluginResult, err error) {
	err = p.LayerLoader.Walk(ctx, func(l layer.Layer, parents layer.GroupList) error {
		parent := parents.Last()
		parentRemoved := parent != nil && res.RemovedLayers.HasLayer(parent.ID())

		if !parentRemoved {
			if pid := l.Plugin(); pid == nil || !pid.Equal(pluginID) {
				// delete infobox fields
				removedProperties := l.Infobox().RemoveAllByPlugin(pluginID)
				if len(removedProperties) > 0 {
					res.RemovedProperties = append(res.RemovedProperties, removedProperties...)
					res.ModifiedLayers = append(res.ModifiedLayers, &l)
				}
				return nil
			}

			parent.Layers().RemoveLayer(l.ID())
			res.ModifiedLayers = append(res.ModifiedLayers, parent.LayerRef())
		}

		res.RemovedLayers = res.RemovedLayers.AppendLayers(l.ID())
		res.RemovedProperties = append(res.RemovedProperties, l.Properties()...)
		res.ModifiedLayers = res.ModifiedLayers.Remove(l.ID())
		return nil
	}, []layer.ID{p.RootLayerID})

	return
}
