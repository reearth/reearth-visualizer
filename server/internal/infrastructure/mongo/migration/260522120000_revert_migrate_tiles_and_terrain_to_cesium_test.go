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

// TestRevertMigrateTilesAndTerrainToCesium_AllTypes verifies all Terravista types
// are reverted to their original legacy types.
func TestRevertMigrateTilesAndTerrainToCesium_AllTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	docs := []interface{}{
		mongodoc.PropertyDocument{
			ID: "prop1", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "google_satellite"},
					},
				}},
			}},
		},
		mongodoc.PropertyDocument{
			ID: "prop2", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "google_roadmap"},
					},
				}},
			}},
		},
		mongodoc.PropertyDocument{
			ID: "prop3", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "nasa_black_marble"},
					},
				}},
			}},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	expected := map[string]string{
		"prop1": "default",
		"prop2": "default_road",
		"prop3": "black_marble",
	}

	for propID, expectedType := range expected {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)

		fields := doc.Items[0].Groups[0].Fields
		require.Len(t, fields, 1, "property %s should have only tile_type", propID)
		assert.Equal(t, expectedType, fields[0].Value.(string), "property %s mismatch", propID)
	}
}

// TestRevertMigrateTilesAndTerrainToCesium_PreservesCesiumIon verifies cesium_ion tiles
// with custom asset IDs are not touched.
func TestRevertMigrateTilesAndTerrainToCesium_PreservesCesiumIon(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "custom", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "grouplist", SchemaGroup: "tiles",
			Groups: []*mongodoc.PropertyItemDocument{{
				Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "cesium_ion"},
					{Field: "cesium_ion_asset_id", Type: "string", Value: "12345"},
				},
			}},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "custom"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	require.Len(t, fields, 2, "cesium_ion tile should be unchanged")
	assert.Equal(t, "cesium_ion", fields[0].Value.(string))
	assert.Equal(t, "12345", fields[1].Value.(string))
}

// TestRevertMigrateTilesAndTerrainToCesium_PreservesOtherTypes verifies tile types
// not in the revert map are not modified.
func TestRevertMigrateTilesAndTerrainToCesium_PreservesOtherTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "other", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "grouplist", SchemaGroup: "tiles",
			Groups: []*mongodoc.PropertyItemDocument{{
				Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "open_street_map"},
				},
			}},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "other"}).Decode(&result)
	require.NoError(t, err)

	assert.Equal(t, "open_street_map", result.Items[0].Groups[0].Fields[0].Value.(string))
}

// TestRevertMigrateTilesAndTerrainToCesium_MultipleTileGroups verifies revert with mixed groups.
func TestRevertMigrateTilesAndTerrainToCesium_MultipleTileGroups(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "multi", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "grouplist", SchemaGroup: "tiles",
			Groups: []*mongodoc.PropertyItemDocument{
				{Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "google_satellite"},
				}},
				{Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "nasa_black_marble"},
				}},
				{Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "open_street_map"},
				}},
			},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "multi"}).Decode(&result)
	require.NoError(t, err)

	groups := result.Items[0].Groups
	require.Len(t, groups, 3)
	assert.Equal(t, "default", groups[0].Fields[0].Value.(string))
	assert.Equal(t, "black_marble", groups[1].Fields[0].Value.(string))
	assert.Equal(t, "open_street_map", groups[2].Fields[0].Value.(string))
}

// TestRevertMigrateTilesAndTerrainToCesium_Idempotent ensures re-running the revert is safe.
func TestRevertMigrateTilesAndTerrainToCesium_Idempotent(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "idempotent", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "grouplist", SchemaGroup: "tiles",
			Groups: []*mongodoc.PropertyItemDocument{{
				Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "google_roadmap"},
				},
			}},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))
	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "idempotent"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	require.Len(t, fields, 1)
	assert.Equal(t, "default_road", fields[0].Value.(string))
}

// TestRevertMigrateTilesAndTerrainToCesium_NoProperties verifies revert on empty collection succeeds.
func TestRevertMigrateTilesAndTerrainToCesium_NoProperties(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	assert.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))
}

// TestRevertMigrateTilesAndTerrainToCesium_TerrainUnchanged verifies terrain is not modified.
func TestRevertMigrateTilesAndTerrainToCesium_TerrainUnchanged(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "terrain", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "group", SchemaGroup: "terrain",
			Fields: []*mongodoc.PropertyFieldDocument{
				{Field: "terrain", Type: "bool", Value: true},
				{Field: "terrainType", Type: "string", Value: "cesium"},
			},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "terrain"}).Decode(&result)
	require.NoError(t, err)

	assert.Len(t, result.Items[0].Fields, 2, "terrain should be unchanged")
}

// TestMigrateAndRevert_RoundTrip verifies migrate then revert returns data to original state.
func TestMigrateAndRevert_RoundTrip(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	docs := []interface{}{
		mongodoc.PropertyDocument{
			ID: "round1", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "default"},
					},
				}},
			}},
		},
		mongodoc.PropertyDocument{
			ID: "round2", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "black_marble"},
					},
				}},
			}},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var migrated mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "round1"}).Decode(&migrated)
	require.NoError(t, err)
	assert.Equal(t, "google_satellite", migrated.Items[0].Groups[0].Fields[0].Value.(string))

	require.NoError(t, RevertMigrateTilesAndTerrainToCesium(ctx, client))

	expected := map[string]string{"round1": "default", "round2": "black_marble"}
	for propID, expectedType := range expected {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)
		assert.Equal(t, expectedType, doc.Items[0].Groups[0].Fields[0].Value.(string))
	}
}
