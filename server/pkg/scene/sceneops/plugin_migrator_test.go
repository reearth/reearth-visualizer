package sceneops

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestPluginMigrator_MigratePlugins(t *testing.T) {
	assert := assert.New(t)
	ctx := context.Background()

	sid := scene.NewID()
	pid1 := plugin.MustID("plugin~1.0.0")
	pid2 := plugin.MustID("plugin~1.0.1")

	pl1ps := property.NewSchema().ID(id.NewPropertySchemaID(pid1, "@")).MustBuild()
	pl2ps := property.NewSchema().ID(id.NewPropertySchemaID(pid2, "@")).MustBuild()

	pl1 := plugin.New().ID(pid1).Schema(pl1ps.ID().Ref()).Extensions([]*plugin.Extension{
		plugin.NewExtension().ID("a").Type(plugin.ExtensionTypeBlock).Schema(pl1ps.ID()).MustBuild(),
	}).MustBuild()
	pl2 := plugin.New().ID(pid2).Schema(pl2ps.ID().Ref()).Extensions([]*plugin.Extension{
		plugin.NewExtension().ID("a").Type(plugin.ExtensionTypeBlock).Schema(pl2ps.ID()).MustBuild(),
	}).MustBuild()

	pl1p := property.New().NewID().Scene(sid).Schema(*pl1.Schema()).MustBuild()
	pl2p := property.New().NewID().Scene(sid).Schema(*pl1.Schema()).MustBuild()

	ibf1 := layer.NewInfoboxField().NewID().Plugin(plugin.OfficialPluginID).Extension("textblock").Property(id.NewPropertyID()).MustBuild()
	ibf2 := layer.NewInfoboxField().NewID().Plugin(pid1).Extension("a").Property(pl2p.ID()).MustBuild()
	ib := layer.NewInfobox([]*layer.InfoboxField{ibf1, ibf2}, id.NewPropertyID())
	l1 := layer.New().NewID().Plugin(plugin.OfficialPluginID.Ref()).Scene(sid).Infobox(ib).Item().MustBuild()
	l2 := layer.New().NewID().Plugin(plugin.OfficialPluginID.Ref()).Scene(sid).Group().Layers(layer.NewIDList([]layer.ID{l1.ID()})).MustBuild()

	tid := accountdomain.NewWorkspaceID()
	sc := scene.New().ID(sid).Workspace(tid).MustBuild()
	sc.Plugins().Add(scene.NewPlugin(pid1, pl1p.ID().Ref()))

	pm := PluginMigrator{
		Dataset:        dataset.LoaderFrom(nil),
		Plugin:         plugin.LoaderFrom(pl1, pl2),
		Property:       property.LoaderFrom([]*property.Property{pl1p, pl2p}),
		Layer:          layer.LoaderBySceneFrom(l1, l2),
		PropertySchema: property.SchemaLoaderFrom(pl1ps, pl2ps),
	}

	result, err := pm.MigratePlugins(ctx, sc, pid1, pid2)
	assert.NoError(err)
	assert.Equal(MigratePluginsResult{
		Scene:             sc,
		Layers:            layer.ListFrom([]layer.Layer{l1}),
		Properties:        property.List{pl1p, pl2p},
		RemovedProperties: []id.PropertyID{},
	}, result)

	assert.NotNil(l1.Infobox().Field(ibf1.ID()))
	assert.Equal(id.OfficialPluginID, l1.Infobox().Field(ibf1.ID()).Plugin())
	assert.NotNil(l1.Infobox().Field(ibf2.ID()))
	assert.Equal(id.OfficialPluginID, l1.Infobox().Field(ibf1.ID()).Plugin())
	assert.Equal(pid2, l1.Infobox().Field(ibf2.ID()).Plugin())
	assert.Equal(pid2, pl2p.Schema().Plugin())
}
