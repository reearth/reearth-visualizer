package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

// TestRepairSetTileCategoryLegacyTileType_FixesGroupShapedLeftover verifies that a
// scene already processed by the buggy SetTileCategory (system tile stuck on the
// "google_satellite" default, widget property still holding its group-shaped legacy
// tiles item) gets its scene property corrected and its widget property cleaned up.
func TestRepairSetTileCategoryLegacyTileType_FixesGroupShapedLeftover(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "repair_scene1",
		Property: "repair_prop1",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "rw1", Plugin: "reearth", Extension: "streetView", Property: "repair_wprop1", Enabled: true},
		},
	})
	require.NoError(t, err)

	// Scene property already has a system tile, but stuck on the default because
	// SetTileCategory failed to read the widget's group-shaped legacy value.
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "repair_prop1",
		Scene: "repair_scene1",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_satellite"},
							{Field: "tile_category", Type: "string", Value: "system"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	// Widget property still has its group-shaped legacy tiles item, never cleaned up.
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "repair_wprop1",
		Scene: "repair_scene1",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "group",
				SchemaGroup: "tiles",
				Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "google_roadmap"},
				},
			},
		},
	})
	require.NoError(t, err)

	require.NoError(t, RepairSetTileCategoryLegacyTileType(ctx, client))

	var scenePropResult mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "repair_prop1"}).Decode(&scenePropResult))
	require.Len(t, scenePropResult.Items, 1)
	require.Len(t, scenePropResult.Items[0].Groups, 1)

	var tileType, tileCategory string
	for _, f := range scenePropResult.Items[0].Groups[0].Fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "tile_category" {
			tileCategory = f.Value.(string)
		}
	}
	assert.Equal(t, "google_roadmap", tileType, "system tile's tile_type should have been corrected")
	assert.Equal(t, "system", tileCategory)

	var widgetPropResult mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "repair_wprop1"}).Decode(&widgetPropResult))
	assert.Empty(t, widgetPropResult.Items, "leftover group-shaped widget tiles item should have been removed")
}

// TestRepairSetTileCategoryLegacyTileType_NoOpWhenAlreadyClean verifies that scenes
// with no leftover group-shaped widget tiles item are left untouched.
func TestRepairSetTileCategoryLegacyTileType_NoOpWhenAlreadyClean(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "repair_scene2",
		Property: "repair_prop2",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "rw2", Plugin: "reearth", Extension: "streetView", Property: "repair_wprop2", Enabled: true},
		},
	})
	require.NoError(t, err)

	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "repair_prop2",
		Scene: "repair_scene2",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_roadmap"},
							{Field: "tile_category", Type: "string", Value: "system"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	// Widget property already cleaned up (correctly, by the fixed SetTileCategory).
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "repair_wprop2",
		Scene: "repair_scene2",
		Items: []*mongodoc.PropertyItemDocument{},
	})
	require.NoError(t, err)

	require.NoError(t, RepairSetTileCategoryLegacyTileType(ctx, client))

	var scenePropResult mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "repair_prop2"}).Decode(&scenePropResult))
	require.Len(t, scenePropResult.Items[0].Groups, 1)

	var tileType string
	for _, f := range scenePropResult.Items[0].Groups[0].Fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
	}
	assert.Equal(t, "google_roadmap", tileType, "should remain unchanged")
}
