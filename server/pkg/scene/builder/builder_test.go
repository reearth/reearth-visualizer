package builder

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/tag"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestSceneBuilder(t *testing.T) {
	publishedAt := time.Date(2019, time.August, 15, 0, 0, 0, 0, time.Local)

	// ids
	sceneID := scene.NewID()
	scenePropertyID := property.NewID()
	propertySchemaID := property.MustSchemaID("hoge~0.1.0/foobar")
	pluginID := layer.MustPluginID("hoge~0.1.0")
	pluginExtension1ID := layer.PluginExtensionID("ext")
	pluginExtension2ID := layer.PluginExtensionID("ext2")
	propertySchemaField1ID := property.FieldID("a")
	propertySchemaField2ID := property.FieldID("b")
	propertySchemaField3ID := property.FieldID("c")
	propertySchemaGroup1ID := property.SchemaGroupID("A")
	propertySchemaGroup2ID := property.SchemaGroupID("B")
	propertyItemID1 := property.NewItemID()
	propertyItemID2 := property.NewItemID()

	// datasets
	dss1id := dataset.NewSchemaID()
	dss2id := dataset.NewSchemaID()
	dss3id := dataset.NewSchemaID()
	ds1id := dataset.NewID()
	ds2id := dataset.NewID()
	ds3id := dataset.NewID()
	ds1f1 := dataset.NewFieldID()
	ds1f2 := dataset.NewFieldID()
	ds2f1 := dataset.NewFieldID()
	ds3f1 := dataset.NewFieldID()
	ds1 := dataset.New().ID(ds1id).Fields([]*dataset.Field{
		dataset.NewField(
			ds1f1,
			dataset.ValueTypeRef.ValueFrom(ds2id),
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
			dataset.ValueTypeRef.ValueFrom(ds3id),
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

	// tags
	tag1 := tag.NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	tag2 := tag.NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	tag3 := tag.NewItem().NewID().Label("unused").Scene(sceneID).MustBuild()
	tag4 := tag.NewGroup().NewID().Label("bar").Scene(sceneID).Tags(tag.IDList{
		tag1.ID(), tag2.ID(), tag3.ID(),
	}).MustBuild()
	tag5 := tag.NewItem().NewID().Label("dummy").Scene(scene.NewID()).MustBuild() // dummy
	tags := tag.List{tag1, tag2, tag3, tag4, tag5}

	// layer tags
	ltag1 := layer.NewTagItem(tag1.ID())
	ltag2 := layer.NewTagItem(tag2.ID())
	ltag3 := layer.NewTagGroup(tag4.ID(), []*layer.TagItem{ltag2})

	// layer1: normal layer item
	layer1p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("xxx"))).
						MustBuild(),
					property.NewField(propertySchemaField2ID).
						Value(property.OptionalValueFrom(property.ValueTypeNumber.ValueFrom(1))).
						MustBuild(),
				}).MustBuild(),
		}).
		MustBuild()
	layer1 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer1p.IDRef()).
		Tags(layer.NewTagList([]layer.Tag{ltag1, ltag3})).
		MustBuild()

	// layer2: normal layer group
	layer21p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("yyy"))).
						MustBuild(),
					property.NewField(propertySchemaField2ID).
						Value(property.OptionalValueFrom(property.ValueTypeNumber.ValueFrom(1))).
						MustBuild(),
				}).MustBuild(),
		}).
		MustBuild()
	layer21 := layer.NewItem().
		NewID().
		Scene(sceneID).
		Plugin(&pluginID).
		Extension(&pluginExtension1ID).
		Property(layer21p.IDRef()).
		Tags(layer.NewTagList([]layer.Tag{ltag2})).
		MustBuild()
	layer2p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("xxx"))).
						MustBuild(),
					property.NewField(propertySchemaField3ID).
						Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("test"))).
						MustBuild(),
				}).MustBuild(),
		}).
		MustBuild()
	layer2ibf1 := layer.NewInfoboxField().
		NewID().
		Plugin(pluginID).
		Extension(pluginExtension1ID).
		Property(layer2p.ID()).
		MustBuild()
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
		Layers(layer.NewIDList([]layer.ID{layer21.ID()})).
		Tags(layer.NewTagList([]layer.Tag{ltag1, ltag3})).
		MustBuild()

	// layer3: full-linked layer item with infobox
	layer3p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						Links(property.NewLinks([]*property.Link{
							property.NewLink(ds2id, dss2id, ds2f1),
							property.NewLink(ds3id, dss3id, ds3f1),
						})).
						MustBuild(),
				}).MustBuild(),
		}).
		MustBuild()
	layer3ibf1 := layer.NewInfoboxField().
		NewID().
		Plugin(pluginID).
		Extension(pluginExtension1ID).
		Property(scenePropertyID).
		MustBuild()
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
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField2ID).
						Value(property.OptionalValueFrom(property.ValueTypeNumber.ValueFrom(1))).
						MustBuild(),
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
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						Links(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss3id, ds3f1),
						})).
						MustBuild(),
					property.NewField(propertySchemaField3ID).
						Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("xxx"))).
						MustBuild(),
				}).MustBuild(),
		}).
		MustBuild()
	layer4ibf1 := layer.NewInfoboxField().
		NewID().
		Plugin(pluginID).
		Extension(pluginExtension1ID).
		Property(layer4p.ID()).
		MustBuild()
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
		Layers(layer.NewIDList([]layer.ID{layer41.ID()})).
		MustBuild()

	// layer5: linked layer group and children with overrided property
	layer51p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						Links(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss1id, ds1f2),
						})).
						MustBuild(),
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
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						Links(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss1id, ds1f1),
							property.NewLinkFieldOnly(dss2id, ds2f1),
							property.NewLinkFieldOnly(dss3id, ds3f1),
						})).
						MustBuild(),
					property.NewField(propertySchemaField2ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						Links(property.NewLinks([]*property.Link{
							property.NewLinkFieldOnly(dss1id, ds1f1),
							property.NewLinkFieldOnly(dss2id, ds2f1),
							property.NewLinkFieldOnly(dss3id, ds3f1),
						})).
						MustBuild(),
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
		Layers(layer.NewIDList([]layer.ID{layer51.ID()})).
		MustBuild()
	layer6p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroupList().NewID().SchemaGroup(propertySchemaGroup2ID).Groups([]*property.Group{
				property.NewGroup().ID(propertyItemID1).SchemaGroup(propertySchemaGroup2ID).
					Fields([]*property.Field{
						property.NewField(propertySchemaField1ID).
							Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("XYZ"))).
							MustBuild(),
					}).MustBuild(),
				property.NewGroup().ID(propertyItemID2).SchemaGroup(propertySchemaGroup2ID).
					Fields([]*property.Field{
						property.NewField(propertySchemaField1ID).
							Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("ZYX"))).
							MustBuild(),
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
	rootLayer := layer.NewGroup().NewID().Scene(sceneID).Layers(layer.NewIDList([]layer.ID{
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
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).Fields([]*property.Field{
				property.NewField(propertySchemaField1ID).
					Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("hogehoge"))).
					MustBuild(),
			}).MustBuild(),
		}).
		MustBuild()

	sceneWidgetID1 := scene.NewWidgetID()
	sceneWidgetID2 := scene.NewWidgetID()
	sceneWidget1 := scene.MustWidget(
		sceneWidgetID1,
		pluginID,
		pluginExtension1ID,
		scenePropertyID,
		false,
		false)
	sceneWidget2 := scene.MustWidget(
		sceneWidgetID2,
		pluginID,
		pluginExtension2ID,
		scenePropertyID,
		true,
		true)
	scenePlugin1 := scene.NewPlugin(pluginID, &scenePropertyID)

	assert.Equal(t, sceneWidgetID1, sceneWidget1.ID())
	assert.Equal(t, sceneWidgetID2, sceneWidget2.ID())

	scene := scene.New().
		ID(sceneID).
		Project(scene.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Property(scenep.ID()).
		Widgets(scene.NewWidgets([]*scene.Widget{
			sceneWidget1, sceneWidget2,
		}, nil)).
		Plugins(scene.NewPlugins([]*scene.Plugin{scenePlugin1})).
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
	tloader := tag.LoaderFrom(tags)
	tsloader := tag.SceneLoaderFrom(tags)

	nlsloader := nlslayer.LoaderFrom([]nlslayer.NLSLayer{})

	expected := &sceneJSON{
		SchemaVersion: version,
		ID:            sceneID.String(),
		PublishedAt:   publishedAt,
		Layers:        nil,
		Property: map[string]interface{}{
			"A": map[string]interface{}{
				"a": "hogehoge",
			},
		},
		Plugins: map[string]map[string]interface{}{
			pluginID.String(): {
				"A": map[string]interface{}{
					"a": "hogehoge",
				},
			},
		},
		Widgets: []*widgetJSON{
			{
				ID:          sceneWidget2.ID().String(),
				PluginID:    sceneWidget2.Plugin().String(),
				ExtensionID: sceneWidget2.Extension().String(),
				Property: map[string]interface{}{
					"A": map[string]interface{}{
						"a": "hogehoge",
					},
				},
				Extended: true,
			},
		},
		WidgetAlignSystem: nil,
		Tags: []*tagJSON{
			{ID: tag4.ID().String(), Label: tag4.Label(), Tags: []tagJSON{
				{ID: tag1.ID().String(), Label: tag1.Label(), Tags: nil},
				{ID: tag2.ID().String(), Label: tag2.Label(), Tags: nil},
				{ID: tag3.ID().String(), Label: tag3.Label(), Tags: nil},
			}},
		},
		Clusters: []*clusterJSON{},
	}

	// exec
	sb := New(lloader, ploader, dloader, tloader, tsloader, nlsloader).ForScene(scene)
	result, err := sb.buildScene(context.Background(), publishedAt, false, false, "")

	assert.NoError(t, err)
	assert.Equal(t, expected, result)
}
