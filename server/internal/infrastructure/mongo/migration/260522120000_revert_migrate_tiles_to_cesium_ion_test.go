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

// TestRevertMigrateTilesToCesiumIon_AllLegacyTypes verifies that all 4 legacy
// tile types can be reverted from cesium_ion back to their original types.
func TestRevertMigrateTilesToCesiumIon_AllLegacyTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed properties with cesium_ion tiles (as if they were migrated)
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
								{Field: "tile_type", Type: "string", Value: "cesium_ion"},
								{Field: "cesium_ion_asset_id", Type: "string", Value: "2"},
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
								{Field: "tile_type", Type: "string", Value: "cesium_ion"},
								{Field: "cesium_ion_asset_id", Type: "string", Value: "3"},
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
								{Field: "tile_type", Type: "string", Value: "cesium_ion"},
								{Field: "cesium_ion_asset_id", Type: "string", Value: "4"},
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
								{Field: "tile_type", Type: "string", Value: "cesium_ion"},
								{Field: "cesium_ion_asset_id", Type: "string", Value: "3812"},
							},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	// Run revert migration
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify all types are reverted and asset IDs removed
	expected := map[string]string{
		"prop1": "default",
		"prop2": "default_label",
		"prop3": "default_road",
		"prop4": "black_marble",
	}

	for propID, expectedType := range expected {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)

		require.Len(t, doc.Items, 1)
		require.Len(t, doc.Items[0].Groups, 1)
		fields := doc.Items[0].Groups[0].Fields

		// Should have only tile_type field, cesium_ion_asset_id removed
		require.Len(t, fields, 1, "property %s should have only tile_type field", propID)
		assert.Equal(t, "tile_type", fields[0].Field)
		assert.Equal(t, expectedType, fields[0].Value.(string), "property %s should be reverted to %s", propID, expectedType)
	}
}

// TestRevertMigrateTilesToCesiumIon_PreservesCustomAssetIDs verifies that
// cesium_ion tiles with custom asset IDs (not in the migration map) are not reverted.
func TestRevertMigrateTilesToCesiumIon_PreservesCustomAssetIDs(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed properties with custom cesium_ion asset IDs
	docs := []interface{}{
		mongodoc.PropertyDocument{
			ID:           "custom1",
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
		mongodoc.PropertyDocument{
			ID:           "custom2",
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
								{Field: "cesium_ion_asset_id", Type: "string", Value: "99999"},
							},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	// Run revert migration
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify custom cesium_ion tiles are unchanged
	for _, propID := range []string{"custom1", "custom2"} {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)

		fields := doc.Items[0].Groups[0].Fields
		require.Len(t, fields, 2, "property %s should keep both fields", propID)

		var tileType, assetID string
		for _, f := range fields {
			if f.Field == "tile_type" {
				tileType = f.Value.(string)
			}
			if f.Field == "cesium_ion_asset_id" {
				assetID = f.Value.(string)
			}
		}

		assert.Equal(t, "cesium_ion", tileType, "property %s tile_type should remain cesium_ion", propID)
		assert.NotEmpty(t, assetID, "property %s should keep its custom asset ID", propID)
	}
}

// TestRevertMigrateTilesToCesiumIon_PreservesModernTypes verifies that
// modern tile types (google_satellite, etc.) are not affected by revert.
func TestRevertMigrateTilesToCesiumIon_PreservesModernTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed properties with modern tile types
	doc := mongodoc.PropertyDocument{
		ID:           "modern",
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
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run revert migration
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify modern type is unchanged
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "modern"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	require.Len(t, fields, 1)
	assert.Equal(t, "google_satellite", fields[0].Value.(string))
}

// TestRevertMigrateTilesToCesiumIon_MultipleTileGroups verifies that revert
// works correctly with multiple tile groups in a single property.
func TestRevertMigrateTilesToCesiumIon_MultipleTileGroups(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with multiple tile groups (mixed)
	doc := mongodoc.PropertyDocument{
		ID:           "multi",
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
							{Field: "cesium_ion_asset_id", Type: "string", Value: "2"},
						},
					},
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "cesium_ion"},
							{Field: "cesium_ion_asset_id", Type: "string", Value: "3812"},
						},
					},
					{
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "cesium_ion"},
							{Field: "cesium_ion_asset_id", Type: "string", Value: "99999"}, // custom
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

	// Run revert migration
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify all groups handled correctly
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "multi"}).Decode(&result)
	require.NoError(t, err)

	groups := result.Items[0].Groups
	require.Len(t, groups, 4)

	// Group 1: asset 2 -> default (reverted, asset ID removed)
	assert.Len(t, groups[0].Fields, 1)
	assert.Equal(t, "default", groups[0].Fields[0].Value.(string))

	// Group 2: asset 3812 -> black_marble (reverted, asset ID removed)
	assert.Len(t, groups[1].Fields, 1)
	assert.Equal(t, "black_marble", groups[1].Fields[0].Value.(string))

	// Group 3: custom asset 99999 (unchanged)
	assert.Len(t, groups[2].Fields, 2)
	assert.Equal(t, "cesium_ion", groups[2].Fields[0].Value.(string))
	assert.Equal(t, "99999", groups[2].Fields[1].Value.(string))

	// Group 4: google_satellite (unchanged)
	assert.Len(t, groups[3].Fields, 1)
	assert.Equal(t, "google_satellite", groups[3].Fields[0].Value.(string))
}

// TestRevertMigrateTilesToCesiumIon_Idempotent ensures that re-running the
// revert migration is safe and doesn't cause errors or data corruption.
func TestRevertMigrateTilesToCesiumIon_Idempotent(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with migrated tile
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
							{Field: "tile_type", Type: "string", Value: "cesium_ion"},
							{Field: "cesium_ion_asset_id", Type: "string", Value: "4"},
						},
					},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	// Run revert twice
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify property is correctly reverted and stable
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "idempotent"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	require.Len(t, fields, 1, "should have only tile_type field")
	assert.Equal(t, "tile_type", fields[0].Field)
	assert.Equal(t, "default_road", fields[0].Value.(string))
}

// TestRevertMigrateTilesToCesiumIon_NoProperties verifies that running the
// revert on an empty collection completes successfully.
func TestRevertMigrateTilesToCesiumIon_NoProperties(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Run revert on empty collection
	err := RevertMigrateTilesToCesiumIon(ctx, client)
	assert.NoError(t, err, "revert should succeed on empty collection")
}

// TestMigrateAndRevert_RoundTrip verifies that migrating and then reverting
// returns the data to its original state.
func TestMigrateAndRevert_RoundTrip(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed properties with original legacy tile types
	originalDocs := []interface{}{
		mongodoc.PropertyDocument{
			ID:           "round1",
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
			ID:           "round2",
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
		mongodoc.PropertyDocument{
			ID:           "round3",
			Scene:        "scene1",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{
				{
					Type:        "grouplist",
					SchemaGroup: "tiles",
					Groups: []*mongodoc.PropertyItemDocument{
						{
							Fields: []*mongodoc.PropertyFieldDocument{}, // empty fields
						},
					},
				},
			},
		},
	}
	_, err := col.InsertMany(ctx, originalDocs)
	require.NoError(t, err)

	// Run forward migration
	require.NoError(t, MigrateTilesToCesiumIon(ctx, client))

	// Verify migration happened
	var migrated mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "round1"}).Decode(&migrated)
	require.NoError(t, err)
	fields := migrated.Items[0].Groups[0].Fields
	var hasCesiumIon bool
	for _, f := range fields {
		if f.Field == "tile_type" && f.Value.(string) == "cesium_ion" {
			hasCesiumIon = true
		}
	}
	assert.True(t, hasCesiumIon, "migration should have converted to cesium_ion")

	// Run revert migration
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify all properties reverted to original state
	expected := map[string]string{
		"round1": "default",
		"round2": "black_marble",
		"round3": "default", // empty fields became default
	}

	for propID, expectedType := range expected {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)

		fields := doc.Items[0].Groups[0].Fields

		// Should only have tile_type field
		var tileType string
		var hasAssetID bool
		for _, f := range fields {
			if f.Field == "tile_type" {
				tileType = f.Value.(string)
			}
			if f.Field == "cesium_ion_asset_id" {
				hasAssetID = true
			}
		}

		assert.Equal(t, expectedType, tileType, "property %s should be reverted to %s", propID, expectedType)
		assert.False(t, hasAssetID, "property %s should not have cesium_ion_asset_id", propID)
	}
}

// TestRevertMigrateTilesToCesiumIon_PartialMigration verifies that revert
// works correctly when some tiles were migrated and others weren't.
func TestRevertMigrateTilesToCesiumIon_PartialMigration(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	// Seed property with mixed state (some migrated, some not)
	doc := mongodoc.PropertyDocument{
		ID:           "partial",
		Scene:        "scene1",
		SchemaPlugin: "reearth",
		SchemaName:   "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type:        "grouplist",
				SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{
					{
						// Migrated tile
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "cesium_ion"},
							{Field: "cesium_ion_asset_id", Type: "string", Value: "2"},
						},
					},
					{
						// Never migrated (was always google_satellite)
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

	// Run revert
	require.NoError(t, RevertMigrateTilesToCesiumIon(ctx, client))

	// Verify migrated tile is reverted, unmigrated tile unchanged
	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "partial"}).Decode(&result)
	require.NoError(t, err)

	groups := result.Items[0].Groups
	require.Len(t, groups, 2)

	// Group 1: reverted to default
	assert.Len(t, groups[0].Fields, 1)
	assert.Equal(t, "default", groups[0].Fields[0].Value.(string))

	// Group 2: unchanged
	assert.Len(t, groups[1].Fields, 1)
	assert.Equal(t, "google_satellite", groups[1].Fields[0].Value.(string))
}
