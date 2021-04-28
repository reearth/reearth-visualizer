package builder

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestSceneBuilder(t *testing.T) {
	// ids
	sceneID := id.NewSceneID()
	scenePropertyID := id.NewPropertyID()
	propertySchemaID := id.MustPropertySchemaID("hoge#0.1.0/foobar")
	pluginID := id.MustPluginID("hoge#0.1.0")
	pluginExtension1ID := id.PluginExtensionID("ext")
	pluginExtension2ID := id.PluginExtensionID("ext2")
	propertySchemaField1ID := id.PropertySchemaFieldID("a")
	propertySchemaField2ID := id.PropertySchemaFieldID("b")
	propertySchemaField3ID := id.PropertySchemaFieldID("c")
	propertySchemaGroup1ID := id.PropertySchemaFieldID("A")
	propertySchemaGroup2ID := id.PropertySchemaFieldID("B")
	propertyItemID1 := id.NewPropertyItemID()
	propertyItemID2 := id.NewPropertyItemID()

	// datasets
	dss1id := id.NewDatasetSchemaID()
	dss2id := id.NewDatasetSchemaID()
	dss3id := id.NewDatasetSchemaID()
	ds1id := id.NewDatasetID()
	ds2id := id.NewDatasetID()
	ds3id := id.NewDatasetID()
	ds1f1 := id.NewDatasetSchemaFieldID()
	ds1f2 := id.NewDatasetSchemaFieldID()
	ds2f1 := id.NewDatasetSchemaFieldID()
	ds3f1 := id.NewDatasetSchemaFieldID()
	ds1 := dataset.New().ID(ds1id).Fields([]*dataset.Field{
		dataset.NewField(
			ds1f1,
			dataset.ValueTypeRef.ValueFrom(ds2id.ID()),
			"ds1f1",
		),
		dataset.NewField(
			ds1f2,
			dataset.ValueTypeString.ValueFrom("a"),
			"ds1f2",
		),
	}).Scene(sceneID).Schema(dss1id).Source("ds1").MustBuild()
	ds2 := dataset.New().ID(ds2id).Fields([]*dataset.Field{
		dataset.NewField(
			ds2f1,
			dataset.ValueTypeRef.ValueFrom(ds3id.ID()),
			"ds2",
		),
	}).Scene(sceneID).Schema(dss2id).Source("ds2").MustBuild()
	ds3 := dataset.New().ID(ds3id).Fields([]*dataset.Field{
		dataset.NewField(
			ds3f1,
			dataset.ValueTypeString.ValueFrom("b"),
			"ds3",
		),
	}).Scene(sceneID).Schema(dss3id).Source("ds3").MustBuild()

	// layer1: normal layer item
	layer1p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("xxx")).
						Build(),
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField2ID).
						TypeUnsafe(property.ValueTypeNumber).
						ValueUnsafe(property.ValueTypeNumber.ValueFromUnsafe(1)).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer1 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer1p.IDRef()).
		MustBuild()

	// layer2: normal layer group
	layer21p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("yyy")).
						Build(),
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField2ID).
						TypeUnsafe(property.ValueTypeNumber).
						ValueUnsafe(property.ValueTypeNumber.ValueFromUnsafe(1)).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer21 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer21p.IDRef()).
		MustBuild()
	layer2p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("xxx")).
						Build(),
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField3ID).
						TypeUnsafe(property.ValueTypeString).
						ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("test")).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer2ibf1 := layer.NewInfoboxField().NewID().Plugin(pluginID).Extension(pluginExtension1ID).Property(layer2p.ID()).MustBuild()
	layer2ib := layer.NewInfobox([]*layer.InfoboxField{
		layer2ibf1,
	}, scenePropertyID)
	layer2 := layer.NewGroup().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer2p.IDRef()).
		Infobox(layer2ib).
		Layers(layer.NewIDList([]id.LayerID{layer21.ID()})).
		MustBuild()

	// layer3: full-linked layer item with infobox
	layer3p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						LinksUnsafe(property.NewLinks([]*property.Link{
							property.NewLink(ds2id, dss2id, ds2f1),
							property.NewLink(ds3id, dss3id, ds3f1),
						})).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer3ibf1 := layer.NewInfoboxField().NewID().Plugin(pluginID).Extension(pluginExtension1ID).Property(scenePropertyID).MustBuild()
	layer3ib := layer.NewInfobox([]*layer.InfoboxField{
		layer3ibf1,
	}, scenePropertyID)
	layer3 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer3p.IDRef()).
		Infobox(layer3ib).
		MustBuild()

	// layer4: linked layer group with infobox and children
	layer41p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField2ID).
						TypeUnsafe(property.ValueTypeNumber).
						ValueUnsafe(property.ValueTypeNumber.ValueFromUnsafe(1)).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer41ibf1 := layer.NewInfoboxField().NewID().Plugin(pluginID).Extension(pluginExtension1ID).Property(layer41p.ID()).MustBuild()
	layer41ib := layer.NewInfobox([]*layer.InfoboxField{
		layer41ibf1,
	}, layer41p.ID())
	layer41 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer41p.IDRef()).
		Infobox(layer41ib).
		LinkedDataset(&ds3id).
		MustBuild()
	layer4p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						LinksUnsafe(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss3id, ds3f1),
						})).
						Build(),
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField3ID).
						TypeUnsafe(property.ValueTypeString).
						ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("xxx")).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer4ibf1 := layer.NewInfoboxField().NewID().Plugin(pluginID).Extension(pluginExtension1ID).Property(layer4p.ID()).MustBuild()
	layer4ib := layer.NewInfobox([]*layer.InfoboxField{
		layer4ibf1,
	}, scenePropertyID)
	layer4 := layer.NewGroup().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer4p.IDRef()).
		Infobox(layer4ib).
		LinkedDatasetSchema(&dss3id).
		Layers(layer.NewIDList([]id.LayerID{layer41.ID()})).
		MustBuild()

	// layer5: linked layer group and children with overrided property
	layer51p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						LinksUnsafe(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss1id, ds1f2),
						})).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer51 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer51p.IDRef()).
		LinkedDataset(&ds1id).
		MustBuild()
	layer5p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						TypeUnsafe(property.ValueTypeString).
						LinksUnsafe(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss1id, ds1f1),
							property.NewLinkFieldOnly(dss2id, ds2f1),
							property.NewLinkFieldOnly(dss3id, ds3f1),
						})).
						Build(),
					property.NewFieldUnsafe().
						FieldUnsafe(propertySchemaField2ID).
						TypeUnsafe(property.ValueTypeString).
						LinksUnsafe(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss1id, ds1f1),
							property.NewLinkFieldOnly(dss2id, ds2f1),
							property.NewLinkFieldOnly(dss3id, ds3f1),
						})).
						Build(),
				}).MustBuild(),
		}).
		MustBuild()
	layer5 := layer.NewGroup().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer5p.IDRef()).
		LinkedDatasetSchema(&dss1id).
		Layers(layer.NewIDList([]id.LayerID{layer51.ID()})).
		MustBuild()
	layer6p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroupList().NewID().Schema(propertySchemaID, propertySchemaGroup2ID).Groups([]*property.Group{
				property.NewGroup().ID(propertyItemID1).Schema(propertySchemaID, propertySchemaGroup2ID).
					Fields([]*property.Field{
						property.NewFieldUnsafe().
							FieldUnsafe(propertySchemaField1ID).
							TypeUnsafe(property.ValueTypeString).
							ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("XYZ")).
							Build(),
					}).MustBuild(),
				property.NewGroup().ID(propertyItemID2).Schema(propertySchemaID, propertySchemaGroup2ID).
					Fields([]*property.Field{
						property.NewFieldUnsafe().
							FieldUnsafe(propertySchemaField1ID).
							TypeUnsafe(property.ValueTypeString).
							ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("ZYX")).
							Build(),
					}).MustBuild(),
			}).MustBuild(),
		}).
		MustBuild()
	layer6 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer6p.IDRef()).
		MustBuild()

	// root layer
	rootLayer := layer.NewGroup().NewID().Scene(sceneID).Layers(layer.NewIDList([]id.LayerID{
		layer1.ID(),
		layer2.ID(),
		layer3.ID(),
		layer4.ID(),
		layer5.ID(),
		layer6.ID(),
	})).MustBuild()

	// scene
	scenep := property.New().
		ID(scenePropertyID).
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().Schema(propertySchemaID, propertySchemaGroup1ID).Fields([]*property.Field{
				property.NewFieldUnsafe().
					FieldUnsafe(propertySchemaField1ID).
					TypeUnsafe(property.ValueTypeString).
					ValueUnsafe(property.ValueTypeString.ValueFromUnsafe("hogehoge")).
					Build(),
			}).MustBuild(),
		}).
		MustBuild()

	sceneWidgetID1 := id.NewWidgetID()
	sceneWidgetID2 := id.NewWidgetID()
	sceneWidget1 := scene.MustNewWidget(&sceneWidgetID1, pluginID, pluginExtension1ID, scenePropertyID, false)
	sceneWidget2 := scene.MustNewWidget(&sceneWidgetID2, pluginID, pluginExtension2ID, scenePropertyID, true)
	scenePlugin1 := scene.NewPlugin(pluginID, &scenePropertyID)

	assert.Equal(t, sceneWidgetID1, sceneWidget1.ID())
	assert.Equal(t, sceneWidgetID2, sceneWidget2.ID())

	scene := scene.New().
		ID(sceneID).
		Project(id.NewProjectID()).
		Team(id.NewTeamID()).
		Property(scenep.ID()).
		WidgetSystem(scene.NewWidgetSystem([]*scene.Widget{
			sceneWidget1, sceneWidget2,
		})).
		PluginSystem(scene.NewPluginSystem([]*scene.Plugin{scenePlugin1})).
		RootLayer(rootLayer.ID()).
		MustBuild()

	// loaders
	dloader := dataset.List{
		ds1, ds2, ds3,
	}.GraphLoader()
	lloader := layer.LoaderFrom([]layer.Layer{
		rootLayer,
		layer1,
		layer2,
		layer21,
		layer3,
		layer4,
		layer41,
		layer5,
		layer51,
		layer6,
	})
	ploader := property.LoaderFrom([]*property.Property{
		scenep,
		layer1p,
		layer2p,
		layer21p,
		layer3p,
		layer4p,
		layer41p,
		layer5p,
		layer51p,
		layer6p,
	})

	// exec
	sb := New(lloader, ploader, dloader)
	publishedAt := time.Date(2019, time.August, 15, 0, 0, 0, 0, time.Local)
	result, err := sb.buildScene(context.Background(), scene, publishedAt)

	// general
	assert.NoError(t, err)
	assert.Equal(t, sceneID.String(), result.ID)
	assert.Equal(t, version, result.SchemaVersion)
	assert.Equal(t, publishedAt, result.PublishedAt)

	// property
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
		},
	}, result.Property, "property")

	// plugins
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
		},
	}, result.Plugins[pluginID.String()], "plugin1 property")

	// widgets
	assert.Equal(t, 1, len(result.Widgets), "widgets len")
	resWidget1 := result.Widgets[0]
	assert.Equal(t, pluginID.String(), resWidget1.PluginID, "widget1 plugin")
	assert.Equal(t, string(pluginExtension2ID), resWidget1.ExtensionID, "widget1 extension")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
		},
	}, resWidget1.Property, "widget1 property")

	// layers
	assert.Equal(t, 6, len(result.Layers), "layers len")

	// layer1
	resLayer1 := result.Layers[0]
	assert.Equal(t, layer1.ID().String(), resLayer1.ID, "layer1 id")
	assert.Equal(t, pluginID.StringRef(), resLayer1.PluginID, "layer1 plugin id")
	assert.Equal(t, pluginExtension1ID.StringRef(), resLayer1.ExtensionID, "layer1 extension id")
	assert.Nil(t, resLayer1.Infobox, "layer1 infobox")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "xxx",
			"b": float64(1),
		},
	}, resLayer1.Property, "layer1 prpperty")

	// layer2
	resLayer2 := result.Layers[1]
	assert.Equal(t, layer21.ID().String(), resLayer2.ID, "layer２ id")
	assert.Equal(t, pluginID.StringRef(), resLayer2.PluginID, "layer２ plugin id")
	assert.Equal(t, pluginExtension1ID.StringRef(), resLayer2.ExtensionID, "layer２ extension id")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
		},
	}, resLayer2.Infobox.Property, "layer2 infobox property")
	assert.Equal(t, 1, len(resLayer2.Infobox.Fields), "layer2 infobox fields len")
	assert.Equal(t, pluginID.String(), resLayer2.Infobox.Fields[0].PluginID, "layer2 infobox field1 plugin")
	assert.Equal(t, string(pluginExtension1ID), resLayer2.Infobox.Fields[0].ExtensionID, "layer2 infobox field1 extension")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "xxx",
			"c": "test",
		},
	}, resLayer2.Infobox.Fields[0].Property, "layer2 infobox field1 property")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "yyy",
			"b": float64(1),
			"c": "test",
		},
	}, resLayer2.Property, "layer2 prpperty")

	// layer3
	resLayer3 := result.Layers[2]
	assert.Equal(t, layer3.ID().String(), resLayer3.ID, "layer3 id")
	assert.Equal(t, pluginID.StringRef(), resLayer3.PluginID, "layer3 plugin id")
	assert.Equal(t, pluginExtension1ID.StringRef(), resLayer3.ExtensionID, "layer3 extension id")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
		},
	}, resLayer3.Infobox.Property, "layer3 infobox property")
	assert.Equal(t, 1, len(resLayer3.Infobox.Fields), "layer3 infobox fields len")
	assert.Equal(t, pluginID.String(), resLayer3.Infobox.Fields[0].PluginID, "layer3 infobox field1 plugin")
	assert.Equal(t, string(pluginExtension1ID), resLayer3.Infobox.Fields[0].ExtensionID, "layer3 infobox field1 extension")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
		},
	}, resLayer3.Infobox.Fields[0].Property, "layer3 infobox field1 property")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "b",
		},
	}, resLayer3.Property, "layer3 prpperty")

	// layer4
	resLayer4 := result.Layers[3]
	assert.Equal(t, layer41.ID().String(), resLayer4.ID, "layer4 id")
	assert.Equal(t, pluginID.StringRef(), resLayer4.PluginID, "layer4 plugin id")
	assert.Equal(t, pluginExtension1ID.StringRef(), resLayer4.ExtensionID, "layer4 extension id")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "hogehoge",
			"b": float64(1),
		},
	}, resLayer4.Infobox.Property, "layer4 infobox property")
	assert.Equal(t, 1, len(resLayer4.Infobox.Fields), "layer4 infobox fields len")
	assert.Equal(t, pluginID.String(), resLayer4.Infobox.Fields[0].PluginID, "layer4 infobox field1 plugin")
	assert.Equal(t, string(pluginExtension1ID), resLayer4.Infobox.Fields[0].ExtensionID, "layer4 infobox field1 extension")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"b": float64(1),
		},
	}, resLayer4.Infobox.Fields[0].Property, "layer4 infobox field1 property")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "b",
			"b": float64(1),
			"c": "xxx",
		},
	}, resLayer4.Property, "layer4 prpperty")

	// layer5
	resLayer5 := result.Layers[4]
	assert.Equal(t, layer51.ID().String(), resLayer5.ID, "layer5 id")
	assert.Equal(t, pluginID.StringRef(), resLayer5.PluginID, "layer5 plugin id")
	assert.Equal(t, pluginExtension1ID.StringRef(), resLayer5.ExtensionID, "layer5 extension id")
	assert.Nil(t, resLayer5.Infobox, "layer5 infobox")
	assert.Equal(t, map[string]interface{}{
		"A": map[string]interface{}{
			"a": "a",
			"b": "b",
		},
	}, resLayer5.Property, "layer5 prpperty")

	// layer6
	resLayer6 := result.Layers[5]
	assert.Equal(t, layer6.ID().String(), resLayer6.ID, "layer6 id")
	assert.Equal(t, pluginID.StringRef(), resLayer6.PluginID, "layer6 plugin id")
	assert.Equal(t, pluginExtension1ID.StringRef(), resLayer6.ExtensionID, "layer6 extension id")
	assert.Nil(t, resLayer6.Infobox, "layer6 infobox")
	assert.Equal(t, map[string]interface{}{
		"B": []map[string]interface{}{
			{
				"a":  "XYZ",
				"id": propertyItemID1.String(),
			},
			{
				"a":  "ZYX",
				"id": propertyItemID2.String(),
			},
		},
	}, resLayer6.Property, "layer6 prpperty")
}
