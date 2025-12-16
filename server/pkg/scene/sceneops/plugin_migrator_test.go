package sceneops

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestPluginMigrator_MigratePlugins(t *testing.T) {
	assert := assert.New(t)
	ctx := context.Background()

	sid := id.NewSceneID()
	pid1 := id.MustPluginID("plugin~1.0.0")
	pid2 := id.MustPluginID("plugin~1.0.1")

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

	tid := accountsID.NewWorkspaceID()
	sc := scene.New().ID(sid).Workspace(tid).MustBuild()
	sc.Plugins().Add(scene.NewPlugin(pid1, pl1p.ID().Ref()))

	pm := PluginMigrator{
		Plugin:         plugin.LoaderFrom(pl1, pl2),
		Property:       property.LoaderFrom([]*property.Property{pl1p, pl2p}),
		PropertySchema: property.SchemaLoaderFrom(pl1ps, pl2ps),
	}

	result, err := pm.MigratePlugins(ctx, sc, pid1, pid2)
	assert.NoError(err)
	assert.Equal(MigratePluginsResult{
		Scene:             sc,
		Properties:        property.List{pl1p},
		RemovedProperties: []id.PropertyID{},
	}, result)

}
