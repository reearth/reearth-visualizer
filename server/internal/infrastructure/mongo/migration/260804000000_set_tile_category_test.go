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

func init() {
	mongotest.Env = "REEARTH_DB"
}

// sceneDocForMigration is the raw scene document shape used when seeding the scene collection.
type sceneDocForMigration struct {
	ID       string `bson:"id"`
	Property string `bson:"property"`
	Widgets  []struct {
		ID        string `bson:"id"`
		Plugin    string `bson:"plugin"`
		Extension string `bson:"extension"`
		Property  string `bson:"property"`
		Enabled   bool   `bson:"enabled"`
	} `bson:"widgets"`
}

// TestSetTileCategory_AddsSystemTileToSceneProperty verifies that when a scene has a
// streetView widget and the scene property has no tiles group yet, a system tile is
// created with tile_type=google_satellite.
func TestSetTileCategory_AddsSystemTileToSceneProperty(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "scene1",
		Property: "prop1",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "w1", Plugin: "reearth", Extension: "streetView", Property: "wprop1", Enabled: true},
		},
	})
	require.NoError(t, err)

	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "prop1",
		Scene: "scene1",
		Items: []*mongodoc.PropertyItemDocument{},
	})
	require.NoError(t, err)

	require.NoError(t, SetTileCategory(ctx, client))

	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "prop1"}).Decode(&result))

	require.Len(t, result.Items, 1, "tiles grouplist should have been created")
	tilesGroup := result.Items[0]
	assert.Equal(t, "tiles", tilesGroup.SchemaGroup)
	assert.Equal(t, "grouplist", tilesGroup.Type)
	require.Len(t, tilesGroup.Groups, 1)

	fields := tilesGroup.Groups[0].Fields
	var tileType, tileCategory string
	for _, f := range fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "tile_category" {
			tileCategory = f.Value.(string)
		}
	}
	assert.Equal(t, "google_satellite", tileType)
	assert.Equal(t, "system", tileCategory)
}

// TestSetTileCategory_CarriesOverLegacyTileType verifies that when the widget property
// has a tiles grouplist with tile_type=google_roadmap, the system tile is created with
// tile_type=google_roadmap.
func TestSetTileCategory_CarriesOverLegacyTileType(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "scene2",
		Property: "prop2",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "w2", Plugin: "reearth", Extension: "googleMapSearch", Property: "wprop2", Enabled: true},
		},
	})
	require.NoError(t, err)

	// Scene property has no tiles group yet.
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "prop2",
		Scene: "scene2",
		Items: []*mongodoc.PropertyItemDocument{},
	})
	require.NoError(t, err)

	// Widget property carries the legacy tile type.
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "wprop2",
		Scene: "scene2",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_roadmap"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	require.NoError(t, SetTileCategory(ctx, client))

	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "prop2"}).Decode(&result))

	require.Len(t, result.Items, 1)
	require.Len(t, result.Items[0].Groups, 1)

	var tileType, tileCategory string
	for _, f := range result.Items[0].Groups[0].Fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "tile_category" {
			tileCategory = f.Value.(string)
		}
	}
	assert.Equal(t, "google_roadmap", tileType, "should carry over legacy tile type from widget property")
	assert.Equal(t, "system", tileCategory)
}

// TestSetTileCategory_PreservesUserTiles verifies that when the scene property already
// has user-added tiles (no tile_category), those tiles are preserved and the system tile
// is added alongside them.
func TestSetTileCategory_PreservesUserTiles(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "scene3",
		Property: "prop3",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "w3", Plugin: "reearth", Extension: "streetView", Property: "wprop3", Enabled: true},
		},
	})
	require.NoError(t, err)

	// Scene property already has a user-added tile.
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "prop3",
		Scene: "scene3",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_satellite"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	require.NoError(t, SetTileCategory(ctx, client))

	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "prop3"}).Decode(&result))

	require.Len(t, result.Items, 1)
	require.Len(t, result.Items[0].Groups, 2, "user tile and system tile should both be present")

	// The last group should be the new system tile.
	var systemFound bool
	for _, group := range result.Items[0].Groups {
		for _, f := range group.Fields {
			if f.Field == "tile_category" {
				if val, ok := f.Value.(string); ok && val == "system" {
					systemFound = true
				}
			}
		}
	}
	assert.True(t, systemFound, "system tile should have been added")
}

// TestSetTileCategory_SkipsIfSystemTileExists verifies that when a scene property already
// has a tile with tile_category=system, the migration is idempotent and does not add
// a duplicate system tile.
func TestSetTileCategory_SkipsIfSystemTileExists(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "scene4",
		Property: "prop4",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "w4", Plugin: "reearth", Extension: "streetView", Property: "wprop4", Enabled: true},
		},
	})
	require.NoError(t, err)

	// Scene property already has a system tile.
	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "prop4",
		Scene: "scene4",
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

	require.NoError(t, SetTileCategory(ctx, client))

	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "prop4"}).Decode(&result))

	require.Len(t, result.Items[0].Groups, 1, "should not have added a duplicate system tile")
}

// TestSetTileCategory_CleansUpWidgetPropertyTilesGroup verifies that the legacy tiles
// grouplist is removed from widget properties after the migration.
func TestSetTileCategory_CleansUpWidgetPropertyTilesGroup(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "scene5",
		Property: "prop5",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "w5", Plugin: "reearth", Extension: "streetView", Property: "wprop5", Enabled: true},
		},
	})
	require.NoError(t, err)

	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "prop5",
		Scene: "scene5",
		Items: []*mongodoc.PropertyItemDocument{},
	})
	require.NoError(t, err)

	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "wprop5",
		Scene: "scene5",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_satellite"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	require.NoError(t, SetTileCategory(ctx, client))

	var widgetProp mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "wprop5"}).Decode(&widgetProp))

	for _, item := range widgetProp.Items {
		if item.SchemaGroup == "tiles" && item.Type == "grouplist" {
			t.Errorf("expected legacy tiles grouplist to be removed from widget property, but found one")
		}
	}
}

// TestSetTileCategory_NoMatchingScenes verifies that when no scenes with
// streetView/googleMapSearch widgets exist, the migration completes without error and
// makes no changes.
func TestSetTileCategory_NoMatchingScenes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	sceneCol := client.WithCollection("scene").Client()
	propCol := client.WithCollection("property").Client()

	// A scene with a different widget that should not be matched.
	_, err := sceneCol.InsertOne(ctx, sceneDocForMigration{
		ID:       "scene_other",
		Property: "prop_other",
		Widgets: []struct {
			ID        string `bson:"id"`
			Plugin    string `bson:"plugin"`
			Extension string `bson:"extension"`
			Property  string `bson:"property"`
			Enabled   bool   `bson:"enabled"`
		}{
			{ID: "w_other", Plugin: "reearth", Extension: "someOtherWidget", Property: "wprop_other", Enabled: true},
		},
	})
	require.NoError(t, err)

	_, err = propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "prop_other",
		Scene: "scene_other",
		Items: []*mongodoc.PropertyItemDocument{},
	})
	require.NoError(t, err)

	require.NoError(t, SetTileCategory(ctx, client))

	// The property should remain unchanged.
	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "prop_other"}).Decode(&result))
	assert.Empty(t, result.Items, "property should not have been modified")
}

// TestRevertSetTileCategory_RemovesSystemTile verifies that when a scene property has a
// system tile alongside a user tile, the revert removes only the system tile and keeps the
// user tile.
func TestRevertSetTileCategory_RemovesSystemTile(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	propCol := client.WithCollection("property").Client()

	_, err := propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "rev_prop1",
		Scene: "rev_scene1",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						// User tile (no tile_category)
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_roadmap"},
						},
					},
					{
						// System tile added by SetTileCategory
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

	require.NoError(t, RevertSetTileCategory(ctx, client))

	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "rev_prop1"}).Decode(&result))

	require.Len(t, result.Items, 1)
	require.Len(t, result.Items[0].Groups, 1, "system tile should have been removed, user tile kept")

	fields := result.Items[0].Groups[0].Fields
	var tileType string
	for _, f := range fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "tile_category" {
			t.Errorf("unexpected tile_category field found after revert")
		}
	}
	assert.Equal(t, "google_roadmap", tileType, "user tile should be preserved")
}

// TestRevertSetTileCategory_RemovesEntireTilesGroupIfEmpty verifies that when a scene
// property has only a system tile in the tiles grouplist, after revert the entire
// grouplist item is removed from doc.Items.
func TestRevertSetTileCategory_RemovesEntireTilesGroupIfEmpty(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	propCol := client.WithCollection("property").Client()

	_, err := propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "rev_prop2",
		Scene: "rev_scene2",
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

	require.NoError(t, RevertSetTileCategory(ctx, client))

	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "rev_prop2"}).Decode(&result))

	for _, item := range result.Items {
		if item.SchemaGroup == "tiles" {
			t.Errorf("expected tiles grouplist to be removed from property Items, but found SchemaGroup=%q", item.SchemaGroup)
		}
	}
}

// TestRevertSetTileCategory_NoSystemTiles verifies that when no system tiles exist, the
// revert migration completes without error and makes no changes.
func TestRevertSetTileCategory_NoSystemTiles(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	propCol := client.WithCollection("property").Client()

	_, err := propCol.InsertOne(ctx, mongodoc.PropertyDocument{
		ID:    "rev_prop3",
		Scene: "rev_scene3",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_satellite"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	require.NoError(t, RevertSetTileCategory(ctx, client))

	// Property should remain unchanged.
	var result mongodoc.PropertyDocument
	require.NoError(t, propCol.FindOne(ctx, bson.M{"id": "rev_prop3"}).Decode(&result))

	require.Len(t, result.Items, 1)
	require.Len(t, result.Items[0].Groups, 1)
	assert.Equal(t, "google_satellite", result.Items[0].Groups[0].Fields[0].Value.(string))
}
