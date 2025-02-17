package layerops

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
)

type Processor struct {
	RootLayerID layer.ID
	LayerLoader layer.Loader
}

type UninstallPluginResult struct {
	ModifiedLayers    layer.List
	RemovedProperties []layer.PropertyID
}

func (p Processor) UninstallPlugin(ctx context.Context, pluginID id.PluginID) (res UninstallPluginResult, err error) {
	err = p.LayerLoader.Walk(ctx, func(l layer.Layer, parents layer.GroupList) error {
		// delete infobox fields
		if removedProperties := l.Infobox().RemoveAllByPlugin(pluginID, nil); len(removedProperties) > 0 {
			res.RemovedProperties = append(res.RemovedProperties, removedProperties...)
			res.ModifiedLayers = append(res.ModifiedLayers, &l)
		}
		return nil
	}, []layer.ID{p.RootLayerID})

	return
}
