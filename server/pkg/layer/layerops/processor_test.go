package layerops

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/stretchr/testify/assert"
)

func TestProcessor_UninstallPlugin(t *testing.T) {
	sid := layer.NewSceneID()
	pid := layer.MustPluginID("hoge~1.0.0")
	pid2 := layer.MustPluginID("hoge~1.0.1")
	ibf1 := layer.NewInfoboxField().NewID().Plugin(pid).Extension("a").Property(layer.NewPropertyID()).MustBuild()
	ibf2 := layer.NewInfoboxField().NewID().Plugin(pid2).Extension("a").Property(layer.NewPropertyID()).MustBuild()
	ib := layer.NewInfobox([]*layer.InfoboxField{ibf1, ibf2}, layer.NewPropertyID())
	l1 := layer.NewItem().NewID().Scene(sid).Property(layer.NewPropertyID().Ref()).Plugin(&id.OfficialPluginID).MustBuild()
	l2 := layer.NewItem().NewID().Scene(sid).Property(layer.NewPropertyID().Ref()).Plugin(&id.OfficialPluginID).MustBuild()
	l3 := layer.NewItem().NewID().Scene(sid).Property(layer.NewPropertyID().Ref()).Plugin(&id.OfficialPluginID).Infobox(ib).MustBuild()
	l4 := layer.NewGroup().NewID().Scene(sid).Property(layer.NewPropertyID().Ref()).Layers(layer.NewIDList([]layer.ID{l1.ID(), l2.ID()})).MustBuild()
	l5 := layer.NewGroup().NewID().Scene(sid).Layers(layer.NewIDList([]layer.ID{l3.ID(), l4.ID()})).MustBuild()

	res, err := Processor{
		LayerLoader: layer.LoaderFrom([]layer.Layer{l1, l2, l3, l4, l5}),
		RootLayerID: l5.ID(),
	}.UninstallPlugin(context.TODO(), pid)

	assert.NoError(t, err)
	assert.Equal(t, UninstallPluginResult{
		ModifiedLayers:    layer.List{l3.LayerRef()},
		RemovedProperties: []layer.PropertyID{ibf1.Property()},
	}, res)
	assert.Equal(t, []*layer.InfoboxField{ibf2}, ib.Fields())
}
