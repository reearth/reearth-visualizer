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

// TestMigrateTilesToCesiumIon_ExplicitOldTileTypes verifies that properties with
// explicit old tile types (default, default_label, default_road, black_marble)
// are migrated to cesium_ion with the appropriate asset IDs.
func TestMigrateTilesToCesiumIon_ExplicitOldTileTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed properties with old tile types
	docs := []interface{}{
		mongodoc.PropertyDocument{
			ID:           "prop1",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{
				{
					Type:        "grouplist",
					SchemaGroup: "tiles",
					Groups: []*mongodoc.PropertyItemDocument{
						{
							Fields: []*mongodoc.PropertyFieldDocument{
								{Field: "tile_type", Type: "string", Value: "default"},
							},
						},
					},
				},
			},
		},
		mongodoc.PropertyDocument{
			ID:           "prop2",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{
				{
					Type:        "grouplist",
					SchemaGroup: "tiles",
					Groups: []*mongodoc.PropertyItemDocument{
						{
							Fields: []*mongodoc.PropertyFieldDocument{
								{Field: "tile_type", Type: "string", Value: "default_label"},
							},
						},
					},
				},
			},
		},
		mongodoc.PropertyDocument{
			ID:           "prop3",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{
				{
					Type:        "grouplist",
					SchemaGroup: "tiles",
					Groups: []*mongodoc.PropertyItemDocument{
						{
							Fields: []*mongodoc.PropertyFieldDocument{
								{Field: "tile_type", Type: "string", Value: "default_road"},
							},
						},
					},
				},
			},
		},
		mongodoc.PropertyDocument{
			ID:           "prop4",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{
				{
					Type:        "grouplist",
					SchemaGroup: "tiles",
					Groups: []*mongodoc.PropertyItemDocument{
						{
							Fields: []*mongodoc.PropertyFieldDocument{
								{Field: "tile_type", Type: "string", Value: "black_marble"},
							},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	// Run migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify results
	expected := map[string]struct {
		tileType string
		assetID  string
	}{
		"prop1": {"cesium_ion", "2"},
		"prop2": {"cesium_ion", "3"},
		"prop3": {"cesium_ion", "4"},
		"prop4": {"cesium_ion", "3812"},
	}

	for propID, exp := range expected {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)

		require.Len(t, doc.Items, 1, "property %s should have 1 item", propID)
		require.Equal(t, "tiles", doc.Items[0].SchemaGroup)
		require.Len(t, doc.Items[0].Groups, 1, "property %s should have 1 tile group", propID)

		fields := doc.Items[0].Groups[0].Fields
		var tileType, assetID string
		for _, f := range fields {
			if f.Field == "tile_type" {
				tileType = f.Value.(string)
			}
			if f.Field == "cesium_ion_asset_id" {
				assetID = f.Value.(string)
			}
		}

		assert.Equal(t, exp.tileType, tileType, "property %s tile_type should be migrated", propID)
		assert.Equal(t, exp.assetID, assetID, "property %s cesium_ion_asset_id should be set", propID)
	}
}

// TestMigrateTilesToCesiumIon_EmptyFields verifies that properties with tiles
// that have empty fields arrays (which means they were using the old default)
// are migrated to cesium_ion with asset ID "2".
func TestMigrateTilesToCesiumIon_EmptyFields(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with empty fields (using old default)
	doc := mongodoc.PropertyDocument{
		ID:           "prop_empty",
		Scene:        "scene1",
		SchemaPlugin: "reearth",
		SchemaName:   "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{}, // Empty fields
					},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify result
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "prop_empty"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	require.Len(t, fields, 2, "should have tile_type and cesium_ion_asset_id fields")

	var tileType, assetID string
	for _, f := range fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "cesium_ion_asset_id" {
			assetID = f.Value.(string)
		}
	}

	assert.Equal(t, "cesium_ion", tileType, "empty fields should default to cesium_ion")
	assert.Equal(t, "2", assetID, "empty fields should get asset ID 2 (old default)")
}

// TestMigrateTilesToCesiumIon_PreservesModernTypes verifies that properties
// with modern tile types (google_satellite, open_street_map, etc.) or already
// cesium_ion are not modified.
func TestMigrateTilesToCesiumIon_PreservesModernTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed properties with modern tile types
	docs := []interface{}{
		mongodoc.PropertyDocument{
			ID:           "modern1",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
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
		},
		mongodoc.PropertyDocument{
			ID:           "modern2",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{
				{
					Type:        "grouplist",
					SchemaGroup: "tiles",
					Groups: []*mongodoc.PropertyItemDocument{
						{
							Fields: []*mongodoc.PropertyFieldDocument{
								{Field: "tile_type", Type: "string", Value: "cesium_ion"},
								{Field: "cesium_ion_asset_id", Type: "string", Value: "12345"},
							},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	// Run migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify google_satellite is unchanged
	var doc1 mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "modern1"}).Decode(&doc1)
	require.NoError(t, err)
	fields1 := doc1.Items[0].Groups[0].Fields
	assert.Len(t, fields1, 1, "google_satellite should have only 1 field")
	assert.Equal(t, "google_satellite", fields1[0].Value.(string))

	// Verify cesium_ion is unchanged
	var doc2 mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "modern2"}).Decode(&doc2)
	require.NoError(t, err)
	fields2 := doc2.Items[0].Groups[0].Fields
	assert.Len(t, fields2, 2, "cesium_ion should have 2 fields")
	assert.Equal(t, "cesium_ion", fields2[0].Value.(string))
	assert.Equal(t, "12345", fields2[1].Value.(string), "asset ID should be unchanged")
}

// TestMigrateTilesToCesiumIon_MultipleTileGroups verifies that properties with
// multiple tile groups (array of tiles) are handled correctly.
func TestMigrateTilesToCesiumIon_MultipleTileGroups(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with multiple tile groups
	doc := mongodoc.PropertyDocument{
		ID:           "multi_tiles",
		Scene:        "scene1",
		SchemaPlugin: "reearth",
		SchemaName:   "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "default"},
						},
					},
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "black_marble"},
						},
					},
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_satellite"},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify all groups are handled correctly
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "multi_tiles"}).Decode(&result)
	require.NoError(t, err)

	groups := result.Items[0].Groups
	require.Len(t, groups, 3, "should have 3 tile groups")

	// First group: default -> cesium_ion with asset 2
	var tile1Type, tile1Asset string
	for _, f := range groups[0].Fields {
		if f.Field == "tile_type" {
			tile1Type = f.Value.(string)
		}
		if f.Field == "cesium_ion_asset_id" {
			tile1Asset = f.Value.(string)
		}
	}
	assert.Equal(t, "cesium_ion", tile1Type)
	assert.Equal(t, "2", tile1Asset)

	// Second group: black_marble -> cesium_ion with asset 3812
	var tile2Type, tile2Asset string
	for _, f := range groups[1].Fields {
		if f.Field == "tile_type" {
			tile2Type = f.Value.(string)
		}
		if f.Field == "cesium_ion_asset_id" {
			tile2Asset = f.Value.(string)
		}
	}
	assert.Equal(t, "cesium_ion", tile2Type)
	assert.Equal(t, "3812", tile2Asset)

	// Third group: google_satellite unchanged
	assert.Len(t, groups[2].Fields, 1, "google_satellite should have only 1 field")
	assert.Equal(t, "google_satellite", groups[2].Fields[0].Value.(string))
}

// TestMigrateTilesToCesiumIon_NonTilesItems verifies that properties with
// non-tiles items (like terrain, navigator, etc.) are not affected.
func TestMigrateTilesToCesiumIon_NonTilesItems(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with terrain and other items
	doc := mongodoc.PropertyDocument{
		ID:           "non_tiles",
		Scene:        "scene1",
		SchemaPlugin: "reearth",
		SchemaName:   "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "group",
				SchemaGroup: "terrain",
				Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "terrain_type", Type: "string", Value: "cesiumion"},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify property is unchanged
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "non_tiles"}).Decode(&result)
	require.NoError(t, err)

	assert.Len(t, result.Items, 1)
	assert.Equal(t, "terrain", result.Items[0].SchemaGroup)
	assert.Len(t, result.Items[0].Fields, 1)
	assert.Equal(t, "cesiumion", result.Items[0].Fields[0].Value.(string))
}

// TestMigrateTilesToCesiumIon_UpdatesExistingAssetID verifies that if a property
// already has cesium_ion_asset_id field, it is updated (not duplicated).
func TestMigrateTilesToCesiumIon_UpdatesExistingAssetID(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with old tile type but existing asset ID
	doc := mongodoc.PropertyDocument{
		ID:           "update_asset",
		Scene:        "scene1",
		SchemaPlugin: "reearth",
		SchemaName:   "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "default_road"},
							{Field: "cesium_ion_asset_id", Type: "string", Value: "wrong_id"},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify asset ID is updated, not duplicated
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "update_asset"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	assert.Len(t, fields, 2, "should have exactly 2 fields (no duplication)")

	var tileType, assetID string
	for _, f := range fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "cesium_ion_asset_id" {
			assetID = f.Value.(string)
		}
	}

	assert.Equal(t, "cesium_ion", tileType)
	assert.Equal(t, "4", assetID, "asset ID should be updated to correct value")
}

// TestMigrateTilesToCesiumIon_Idempotent ensures that re-running the migration
// on already-migrated data is a no-op and does not cause errors or duplicate fields.
func TestMigrateTilesToCesiumIon_Idempotent(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with old tile type
	doc := mongodoc.PropertyDocument{
		ID:           "idempotent",
		Scene:        "scene1",
		SchemaPlugin: "reearth",
		SchemaName:   "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "default"},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run migration twice
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify property is correctly migrated and no duplicates
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "idempotent"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	assert.Len(t, fields, 2, "should have exactly 2 fields after multiple runs")

	var tileType, assetID string
	for _, f := range fields {
		if f.Field == "tile_type" {
			tileType = f.Value.(string)
		}
		if f.Field == "cesium_ion_asset_id" {
			assetID = f.Value.(string)
		}
	}

	assert.Equal(t, "cesium_ion", tileType)
	assert.Equal(t, "2", assetID)
}

// TestMigrateTilesToCesiumIon_NoProperties verifies that running the migration
// on an empty collection completes successfully.
func TestMigrateTilesToCesiumIon_NoProperties(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Run migration on empty collection
	err := MigrateTilesToCesiumIon(ctx, client)
	assert.NoError(t, err, "migration should succeed on empty collection")
}
