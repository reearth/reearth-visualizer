package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"io"
	"os"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

const mockPluginManifest = `{
  "id": "testplugin",
  "version": "1.0.1",
  "name": "testplugin",
  "extensions": [
	  {
      "id": "block",
			"type": "block",
			"schema": {
				"groups": [
					{
						"id": "default",
						"fields": [
							{
								"id": "field",
								"type": "string"
							}
						]
					}
				]
			}
		},
	  {
      "id": "widget",
			"type": "widget",
			"schema": {}
		}
  ]
}`

var mockPluginID = id.MustPluginID("testplugin~1.0.1")
var mockPluginFiles = map[string]string{
	"reearth.yml": mockPluginManifest,
	"block.js":    "// barfoo",
}
var mockPluginArchiveZip bytes.Buffer

func init() {
	zbuf := bytes.Buffer{}
	zw := zip.NewWriter(&zbuf)
	for p, f := range mockPluginFiles {
		w, _ := zw.Create(p)
		_, _ = w.Write([]byte(f))
	}
	_ = zw.Close()
	mockPluginArchiveZip = zbuf
}

func mockFS(files map[string]string) afero.Fs {
	mfs := afero.NewMemMapFs()
	for n, c := range files {
		f, err := mfs.Create(n)
		if err != nil {
			panic(err)
		}
		_, _ = f.Write([]byte(c))
		_ = f.Close()
	}
	return mfs
}

func TestPlugin_Upload_New(t *testing.T) {
	// upload a new plugin
	ctx := context.Background()
	ws := accountdomain.NewWorkspaceID()
	sid := id.NewSceneID()
	pid := mockPluginID.WithScene(sid.Ref())

	repos := memory.New()
	mfs := mockFS(nil)
	files, err := fs.NewFile(mfs, "")
	assert.NoError(t, err)
	scene := scene.New().ID(sid).Workspace(ws).MustBuild()
	_ = repos.Scene.Save(ctx, scene)

	uc := &Plugin{
		sceneRepo:          repos.Scene,
		pluginRepo:         repos.Plugin,
		propertySchemaRepo: repos.PropertySchema,
		propertyRepo:       repos.Property,
		layerRepo:          repos.Layer,
		file:               files,
		transaction:        repos.Transaction,
	}
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: []accountdomain.WorkspaceID{ws},
		},
		WritableScenes: []id.SceneID{sid},
	}

	reader := bytes.NewReader(mockPluginArchiveZip.Bytes())
	pl, s, err := uc.Upload(ctx, reader, scene.ID(), op)
	assert.NoError(t, err)
	assert.Equal(t, scene.ID(), s.ID())
	assert.Equal(t, pid, pl.ID())

	// scene
	nscene, err := repos.Scene.FindByID(ctx, scene.ID())
	assert.NoError(t, err)
	assert.True(t, nscene.Plugins().HasPlugin(pl.ID()))

	// plugin
	npl, err := repos.Plugin.FindByID(ctx, pid)
	assert.NoError(t, err)
	assert.Equal(t, pid, npl.ID())

	npf, err := mfs.Open("plugins/" + pid.String() + "/block.js")
	assert.NoError(t, err)
	npfc, _ := io.ReadAll(npf)
	assert.Equal(t, "// barfoo", string(npfc))
}

// The plugin and its files should be replaced with the new one (old files are deleted)
// Properties that schema is changed should be migrated
// Layers, widgets, blocks, properties, and property schemas that extension is deleted should deleted
func TestPlugin_Upload_SameVersion(t *testing.T) {
	// upgrade plugin to the same version
	// 1 extension is deleted -> property schema, layers, and properties of the extension should be deleted
	// old plugin files should be deleted

	ctx := context.Background()
	ws := accountdomain.NewWorkspaceID()
	sid := id.NewSceneID()
	pid := mockPluginID.WithScene(sid.Ref())
	eid1 := id.PluginExtensionID("marker")
	eid2 := id.PluginExtensionID("widget2")
	wid1 := id.NewWidgetID()

	repos := memory.New()
	mfs := mockFS(map[string]string{
		"plugins/" + pid.String() + "/hogehoge": "foobar",
	})
	files, err := fs.NewFile(mfs, "")
	assert.NoError(t, err)

	ps := property.NewSchema().ID(property.NewSchemaID(pid, eid1.String())).MustBuild()
	ps2 := property.NewSchema().ID(property.NewSchemaID(pid, eid2.String())).MustBuild()
	pl := plugin.New().ID(pid).Extensions([]*plugin.Extension{
		plugin.NewExtension().ID(eid1).Type(plugin.ExtensionTypePrimitive).Schema(ps.ID()).MustBuild(),
		plugin.NewExtension().ID(eid2).Type(plugin.ExtensionTypeWidget).Schema(ps2.ID()).MustBuild(),
	}).MustBuild()

	p1 := property.New().NewID().Schema(ps.ID()).Scene(sid).MustBuild()
	p2 := property.New().NewID().Schema(ps2.ID()).Scene(sid).MustBuild()
	pluginLayer := layer.NewItem().NewID().Scene(sid).Plugin(pid.Ref()).Extension(eid1.Ref()).Property(p1.IDRef()).MustBuild()
	rootLayer := layer.NewGroup().NewID().Scene(sid).Layers(layer.NewIDList([]layer.ID{pluginLayer.ID()})).Root(true).MustBuild()
	scene := scene.New().ID(sid).Workspace(ws).Plugins(scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(pid, nil),
	})).Widgets(scene.NewWidgets([]*scene.Widget{
		scene.MustWidget(wid1, pid, eid2, p2.ID(), false, false),
	}, nil)).MustBuild()

	_ = repos.PropertySchema.Save(ctx, ps)
	_ = repos.Plugin.Save(ctx, pl)
	_ = repos.Property.Save(ctx, p1)
	_ = repos.Layer.SaveAll(ctx, layer.List{pluginLayer.LayerRef(), rootLayer.LayerRef()})
	_ = repos.Scene.Save(ctx, scene)

	uc := &Plugin{
		sceneRepo:          repos.Scene,
		pluginRepo:         repos.Plugin,
		propertySchemaRepo: repos.PropertySchema,
		propertyRepo:       repos.Property,
		layerRepo:          repos.Layer,
		file:               files,
		transaction:        repos.Transaction,
	}
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: []accountdomain.WorkspaceID{ws},
		},
		WritableScenes: []id.SceneID{sid},
	}

	reader := bytes.NewReader(mockPluginArchiveZip.Bytes())
	pl, s, err := uc.Upload(ctx, reader, scene.ID(), op)

	assert.NoError(t, err)
	assert.Equal(t, scene.ID(), s.ID())
	assert.Equal(t, pid, pl.ID())

	// scene
	nscene, err := repos.Scene.FindByID(ctx, scene.ID())
	assert.NoError(t, err)
	assert.True(t, nscene.Plugins().HasPlugin(pl.ID()))
	assert.Nil(t, nscene.Widgets().Widget(wid1))

	nlp2, err := repos.Property.FindByID(ctx, p1.ID())
	assert.Nil(t, nlp2) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	// plugin
	npl, err := repos.Plugin.FindByID(ctx, pid)
	assert.NoError(t, err)
	assert.Equal(t, pid, npl.ID())

	nlps, err := repos.PropertySchema.FindByID(ctx, ps.ID())
	assert.Nil(t, nlps) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	nlps2, err := repos.PropertySchema.FindByID(ctx, ps2.ID())
	assert.Nil(t, nlps2) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	_, err = mfs.Open("plugins/" + pid.String() + "/hogehoge")
	assert.True(t, os.IsNotExist(err)) // deleted

	npf, err := mfs.Open("plugins/" + pid.String() + "/block.js")
	assert.NoError(t, err)
	npfc, _ := io.ReadAll(npf)
	assert.Equal(t, "// barfoo", string(npfc))

	// layer
	nlp, err := repos.Property.FindByID(ctx, p1.ID())
	assert.Nil(t, nlp) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	nl, err := repos.Layer.FindByID(ctx, pluginLayer.ID())
	assert.Nil(t, nl) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	nrl, err := repos.Layer.FindGroupByID(ctx, rootLayer.ID())
	assert.NoError(t, err)
	assert.Equal(t, []layer.ID{}, nrl.Layers().Layers()) // deleted
}

// The plugin and its files should be newrly created (old plugin and files are deleted if the plugin is private)
// Properties that schema is changed should be migrated
// Layers, widgets, blocks, properties, and property schemas that extension is deleted should deleted
// Plugin field of layers, widgets, block, properties, and property schemas are replaced with the new plugin ID
func TestPlugin_Upload_DiffVersion(t *testing.T) {
	// upgrade plugin to the different version
	// plugin ID of property and layers should be updated

	ctx := context.Background()
	ws := accountdomain.NewWorkspaceID()
	sid := id.NewSceneID()
	oldpid := id.MustPluginID("testplugin~1.0.0").WithScene(sid.Ref())
	pid := mockPluginID.WithScene(sid.Ref())
	eid1 := id.PluginExtensionID("block")
	eid2 := id.PluginExtensionID("widget")
	nlpsid1 := id.NewPropertySchemaID(pid, eid1.String())
	nlpsid2 := id.NewPropertySchemaID(pid, eid2.String())
	wid := id.NewWidgetID()

	repos := memory.New()
	mfs := mockFS(map[string]string{
		"plugins/" + oldpid.String() + "/hogehoge": "foobar",
	})
	files, err := fs.NewFile(mfs, "")
	assert.NoError(t, err)

	oldpsf := property.NewSchemaField().ID("field").Type(property.ValueTypeNumber).MustBuild()
	oldpsg := property.NewSchemaGroup().ID("default").Fields([]*property.SchemaField{oldpsf}).MustBuild()
	oldps := property.NewSchema().ID(property.NewSchemaID(oldpid, eid1.String())).Groups(property.NewSchemaGroupList(
		[]*property.SchemaGroup{oldpsg},
	)).MustBuild()
	oldps2 := property.NewSchema().ID(property.NewSchemaID(oldpid, eid2.String())).MustBuild()
	oldpl := plugin.New().ID(oldpid).Extensions([]*plugin.Extension{
		plugin.NewExtension().ID(eid1).Type(plugin.ExtensionTypeBlock).Schema(oldps.ID()).MustBuild(),
		plugin.NewExtension().ID(eid2).Type(plugin.ExtensionTypeWidget).Schema(oldps2.ID()).MustBuild(),
	}).MustBuild()

	pf := property.NewField("field").Value(property.ValueTypeNumber.ValueFrom(100).Some()).MustBuild()
	pg := property.NewGroup().NewID().SchemaGroup(oldpsg.ID()).Fields([]*property.Field{pf}).MustBuild()
	oldp := property.New().NewID().Schema(oldps.ID()).Scene(sid).Items([]property.Item{pg}).MustBuild()
	oldp2 := property.New().NewID().Schema(oldps.ID()).Scene(sid).MustBuild()
	oldp3 := property.New().NewID().Schema(oldps.ID()).Scene(sid).MustBuild()
	oldp4 := property.New().NewID().Schema(oldps2.ID()).Scene(sid).MustBuild()
	ib := layer.NewInfobox([]*layer.InfoboxField{
		layer.NewInfoboxField().NewID().Plugin(oldp3.Schema().Plugin()).Extension(plugin.ExtensionID(oldp3.Schema().ID())).Property(oldp3.ID()).MustBuild(),
	}, oldp2.ID())
	pluginLayer := layer.NewItem().NewID().Scene(sid).Plugin(oldpid.Ref()).Extension(eid1.Ref()).Property(oldp.IDRef()).Infobox(ib).MustBuild()
	rootLayer := layer.NewGroup().NewID().Scene(sid).Layers(layer.NewIDList([]layer.ID{pluginLayer.ID()})).Root(true).MustBuild()
	scene := scene.New().ID(sid).Workspace(ws).Plugins(scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(oldpid, nil),
	})).Widgets(scene.NewWidgets([]*scene.Widget{
		scene.MustWidget(wid, oldpid, eid2, oldp4.ID(), true, false),
	}, nil)).MustBuild()

	_ = repos.PropertySchema.SaveAll(ctx, property.SchemaList{oldps, oldps2})
	_ = repos.Plugin.Save(ctx, oldpl)
	_ = repos.Property.SaveAll(ctx, property.List{oldp, oldp2, oldp3, oldp4})
	_ = repos.Layer.SaveAll(ctx, layer.List{pluginLayer.LayerRef(), rootLayer.LayerRef()})
	_ = repos.Scene.Save(ctx, scene)

	uc := &Plugin{
		sceneRepo:          repos.Scene,
		pluginRepo:         repos.Plugin,
		propertySchemaRepo: repos.PropertySchema,
		propertyRepo:       repos.Property,
		layerRepo:          repos.Layer,
		file:               files,
		transaction:        repos.Transaction,
	}
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: []accountdomain.WorkspaceID{ws},
		},
		WritableScenes: []id.SceneID{sid},
	}

	reader := bytes.NewReader(mockPluginArchiveZip.Bytes())
	oldpl, s2, err := uc.Upload(ctx, reader, sid, op)

	assert.NoError(t, err)
	assert.Equal(t, scene.ID(), s2.ID())
	assert.Equal(t, pid, oldpl.ID())

	// scene
	nscene, err := repos.Scene.FindByID(ctx, scene.ID())
	assert.NoError(t, err)
	assert.False(t, nscene.Plugins().HasPlugin(oldpid))
	assert.True(t, nscene.Plugins().HasPlugin(pid))
	assert.Equal(t, pid, nscene.Widgets().Widget(wid).Plugin())
	assert.Equal(t, eid2, nscene.Widgets().Widget(wid).Extension())

	// plugin
	opl, err := repos.Plugin.FindByID(ctx, oldpid)
	assert.Nil(t, opl) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	npl, err := repos.Plugin.FindByID(ctx, pid)
	assert.NoError(t, err)
	assert.Equal(t, pid, npl.ID())

	olps, err := repos.PropertySchema.FindByID(ctx, oldps.ID())
	assert.Nil(t, olps) // deleted
	assert.Equal(t, rerror.ErrNotFound, err)

	nlps1, err := repos.PropertySchema.FindByID(ctx, nlpsid1)
	assert.NoError(t, err)
	assert.Equal(t, nlpsid1, nlps1.ID())

	nlps2, err := repos.PropertySchema.FindByID(ctx, nlpsid2)
	assert.NoError(t, err)
	assert.Equal(t, nlpsid2, nlps2.ID())

	_, err = mfs.Open("plugins/" + oldpid.String() + "/hogehoge")
	assert.True(t, os.IsNotExist(err)) // deleted

	npf, err := mfs.Open("plugins/" + pid.String() + "/block.js")
	assert.NoError(t, err)
	npfc, _ := io.ReadAll(npf)
	assert.Equal(t, "// barfoo", string(npfc))

	// layer
	nl, err := repos.Layer.FindByID(ctx, pluginLayer.ID())
	assert.NoError(t, err)
	assert.Equal(t, pid, *nl.Plugin())
	assert.Equal(t, eid1, *nl.Extension())
	assert.Equal(t, oldp.ID(), *nl.Property())
	assert.Equal(t, oldp2.ID(), nl.Infobox().Property())
	assert.Equal(t, oldp3.ID(), nl.Infobox().FieldAt(0).Property())

	nlp, err := repos.Property.FindByID(ctx, *nl.Property())
	assert.NoError(t, err)
	assert.Equal(t, *nl.Property(), nlp.ID())
	assert.Equal(t, nlpsid1, nlp.Schema())
	assert.Equal(t, property.ValueTypeString.ValueFrom("100"), property.ToGroup(nlp.ItemBySchema("default")).Field("field").Value())

	nlp2, err := repos.Property.FindByID(ctx, oldp2.ID())
	assert.NoError(t, err)
	assert.Equal(t, nlpsid1, nlp2.Schema())

	nlp3, err := repos.Property.FindByID(ctx, oldp3.ID())
	assert.NoError(t, err)
	assert.Equal(t, nlpsid1, nlp3.Schema())
}
