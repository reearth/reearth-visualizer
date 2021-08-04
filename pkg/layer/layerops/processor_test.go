package layerops

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/stretchr/testify/assert"
)

func TestProcessor_UninstallPlugin(t *testing.T) {
	sid := id.NewSceneID()
	pid := id.MustPluginID("hoge~1.0.0")
	pid2 := id.MustPluginID("hoge~1.0.1")
	ibf1 := layer.NewInfoboxField().NewID().Plugin(pid).Extension("a").Property(id.NewPropertyID()).MustBuild()
	ibf2 := layer.NewInfoboxField().NewID().Plugin(pid2).Extension("a").Property(id.NewPropertyID()).MustBuild()
	ib := layer.NewInfobox([]*layer.InfoboxField{ibf1, ibf2}, id.NewPropertyID())
	l1 := layer.NewItem().NewID().Scene(sid).Property(id.NewPropertyID().Ref()).Plugin(&pid).MustBuild()
	l2 := layer.NewItem().NewID().Scene(sid).Property(id.NewPropertyID().Ref()).Plugin(&pid2).MustBuild()
	l3 := layer.NewItem().NewID().Scene(sid).Property(id.NewPropertyID().Ref()).Plugin(&pid2).Infobox(ib).MustBuild()
	l4 := layer.NewGroup().NewID().Scene(sid).Property(id.NewPropertyID().Ref()).Layers(layer.NewIDList([]id.LayerID{l1.ID(), l2.ID()})).MustBuild()
	l5 := layer.NewGroup().NewID().Scene(sid).Layers(layer.NewIDList([]id.LayerID{l3.ID(), l4.ID()})).MustBuild()

	res, err := Processor{
		LayerLoader: layer.LoaderFrom([]layer.Layer{l1, l2, l3, l4, l5}),
		RootLayerID: l5.ID(),
	}.UninstallPlugin(context.TODO(), pid)

	assert.NoError(t, err)
	assert.Equal(t, UninstallPluginResult{
		ModifiedLayers:    layer.List{l3.LayerRef(), l4.LayerRef()},
		RemovedLayers:     layer.NewIDList([]id.LayerID{l1.ID()}),
		RemovedProperties: []id.PropertyID{ibf1.Property(), *l1.Property()},
	}, res)

	assert.Equal(t, layer.NewIDList([]id.LayerID{l2.ID()}), l4.Layers())
	assert.Equal(t, []*layer.InfoboxField{ibf2}, ib.Fields())
}
