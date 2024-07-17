package builder

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestSceneBuilder(t *testing.T) {
	publishedAt := time.Date(2019, time.August, 15, 0, 0, 0, 0, time.Local)

	// ids
	sceneID := scene.NewID()
	scenePropertyID := property.NewID()
	propertySchemaID := property.MustSchemaID("hoge~0.1.0/foobar")
	propertySchemaField1ID := property.FieldID("a")
	propertySchemaField2ID := property.FieldID("b")
	propertySchemaField3ID := property.FieldID("c")
	propertySchemaGroup1ID := property.SchemaGroupID("A")
	propertySchemaGroup2ID := property.SchemaGroupID("B")
	propertyItemID1 := property.NewItemID()
	propertyItemID2 := property.NewItemID()

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
						MustBuild(),
				}).MustBuild(),
		}).
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
	layer4p := property.New().
		NewID().
		Scene(sceneID).
		Schema(propertySchemaID).
		Items([]property.Item{
			property.NewGroup().NewID().SchemaGroup(propertySchemaGroup1ID).
				Fields([]*property.Field{
					property.NewField(propertySchemaField1ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						MustBuild(),
					property.NewField(propertySchemaField3ID).
						Value(property.OptionalValueFrom(property.ValueTypeString.ValueFrom("xxx"))).
						MustBuild(),
				}).MustBuild(),
		}).
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
						MustBuild(),
				}).MustBuild(),
		}).
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
						MustBuild(),
					property.NewField(propertySchemaField2ID).
						Value(property.NewOptionalValue(property.ValueTypeString, nil)).
						MustBuild(),
				}).MustBuild(),
		}).
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

	scene := scene.New().
		ID(sceneID).
		Project(scene.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Property(scenep.ID()).
		Widgets(scene.NewWidgets([]*scene.Widget{}, nil)).
		Plugins(scene.NewPlugins([]*scene.Plugin{})).
		MustBuild()

	// loaders
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

	nlsloader := nlslayer.LoaderFrom([]nlslayer.NLSLayer{})

	expected := &sceneJSON{
		SchemaVersion:     version,
		ID:                sceneID.String(),
		PublishedAt:       publishedAt,
		Property:          nil,
		Plugins:           map[string]map[string]interface{}{},
		Widgets:           []*widgetJSON{},
		WidgetAlignSystem: nil,
		Clusters:          []*clusterJSON{},
	}

	// exec
	sb := New(ploader, nlsloader).ForScene(scene)
	result, err := sb.buildScene(context.Background(), publishedAt, false, false, "")

	assert.NoError(t, err)
	assert.Equal(t, expected, result)
}
