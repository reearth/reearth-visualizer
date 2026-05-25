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

// TestMigrateTilesAndTerrainToCesium_ExplicitOldTileTypes verifies that properties with
// explicit old tile types are migrated to their Terravista equivalents.
func TestMigrateTilesAndTerrainToCesium_ExplicitOldTileTypes(t *testing.T) {
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
						{Field: "tile_type", Type: "string", Value: "default"},
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
						{Field: "tile_type", Type: "string", Value: "default_label"},
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
						{Field: "tile_type", Type: "string", Value: "default_road"},
					},
				}},
			}},
		},
		mongodoc.PropertyDocument{
			ID: "prop4", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
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

	expected := map[string]string{
		"prop1": "google_satellite",
		"prop2": "google_satellite",
		"prop3": "google_roadmap",
		"prop4": "nasa_black_marble",
	}

	for propID, expType := range expected {
		var doc mongodoc.PropertyDocument
		err := col.FindOne(ctx, bson.M{"id": propID}).Decode(&doc)
		require.NoError(t, err)

		fields := doc.Items[0].Groups[0].Fields
		require.Len(t, fields, 1, "property %s should have exactly 1 field (no cesium_ion_asset_id)", propID)
		assert.Equal(t, expType, fields[0].Value.(string), "property %s tile_type mismatch", propID)
	}
}

// TestMigrateTilesAndTerrainToCesium_EmptyFields verifies that tiles with no tile_type
// (empty fields) are left unchanged.
func TestMigrateTilesAndTerrainToCesium_EmptyFields(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "prop_empty", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "grouplist", SchemaGroup: "tiles",
			Groups: []*mongodoc.PropertyItemDocument{{
				Fields: []*mongodoc.PropertyFieldDocument{},
			}},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "prop_empty"}).Decode(&result)
	require.NoError(t, err)

	assert.Empty(t, result.Items[0].Groups[0].Fields, "empty fields should remain untouched")
}

// TestMigrateTilesAndTerrainToCesium_PreservesModernTypes verifies that modern tile types
// and cesium_ion with custom asset IDs are not modified.
func TestMigrateTilesAndTerrainToCesium_PreservesModernTypes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	docs := []interface{}{
		mongodoc.PropertyDocument{
			ID: "modern1", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
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
			ID: "modern2", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
			Items: []*mongodoc.PropertyItemDocument{{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "cesium_ion"},
						{Field: "cesium_ion_asset_id", Type: "string", Value: "12345"},
					},
				}},
			}},
		},
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var doc1 mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "modern1"}).Decode(&doc1)
	require.NoError(t, err)
	assert.Equal(t, "google_satellite", doc1.Items[0].Groups[0].Fields[0].Value.(string))

	var doc2 mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "modern2"}).Decode(&doc2)
	require.NoError(t, err)
	fields2 := doc2.Items[0].Groups[0].Fields
	assert.Len(t, fields2, 2)
	assert.Equal(t, "cesium_ion", fields2[0].Value.(string))
	assert.Equal(t, "12345", fields2[1].Value.(string))
}

// TestMigrateTilesAndTerrainToCesium_MultipleTileGroups verifies mixed groups are handled correctly.
func TestMigrateTilesAndTerrainToCesium_MultipleTileGroups(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "multi_tiles", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "grouplist", SchemaGroup: "tiles",
			Groups: []*mongodoc.PropertyItemDocument{
				{Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "default"},
				}},
				{Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "black_marble"},
				}},
				{Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "tile_type", Type: "string", Value: "google_satellite"},
				}},
			},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "multi_tiles"}).Decode(&result)
	require.NoError(t, err)

	groups := result.Items[0].Groups
	require.Len(t, groups, 3)
	assert.Equal(t, "google_satellite", groups[0].Fields[0].Value.(string))
	assert.Equal(t, "nasa_black_marble", groups[1].Fields[0].Value.(string))
	assert.Equal(t, "google_satellite", groups[2].Fields[0].Value.(string))
}

// TestMigrateTilesAndTerrainToCesium_NonTilesItems verifies terrain and other items are not affected.
func TestMigrateTilesAndTerrainToCesium_NonTilesItems(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "non_tiles", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "group", SchemaGroup: "terrain",
			Fields: []*mongodoc.PropertyFieldDocument{
				{Field: "terrain_type", Type: "string", Value: "cesiumion"},
			},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "non_tiles"}).Decode(&result)
	require.NoError(t, err)

	assert.Len(t, result.Items, 1)
	assert.Equal(t, "terrain", result.Items[0].SchemaGroup)
	assert.Equal(t, "cesiumion", result.Items[0].Fields[0].Value.(string))
}

// TestMigrateTilesAndTerrainToCesium_Idempotent ensures re-running the migration is safe.
func TestMigrateTilesAndTerrainToCesium_Idempotent(t *testing.T) {
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
					{Field: "tile_type", Type: "string", Value: "default"},
				},
			}},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))
	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "idempotent"}).Decode(&result)
	require.NoError(t, err)

	fields := result.Items[0].Groups[0].Fields
	assert.Len(t, fields, 1)
	assert.Equal(t, "google_satellite", fields[0].Value.(string))
}

// TestMigrateTilesAndTerrainToCesium_NoProperties verifies migration on empty collection succeeds.
func TestMigrateTilesAndTerrainToCesium_NoProperties(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	assert.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))
}

// TestMigrateTilesAndTerrainToCesium_TerrainUnchanged verifies terrain items are not modified.
func TestMigrateTilesAndTerrainToCesium_TerrainUnchanged(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "terrain1", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{{
			Type: "group", SchemaGroup: "terrain",
			Fields: []*mongodoc.PropertyFieldDocument{
				{Field: "terrain", Type: "bool", Value: true},
			},
		}},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "terrain1"}).Decode(&result)
	require.NoError(t, err)

	assert.Len(t, result.Items[0].Fields, 1, "terrain should remain untouched")
	assert.Equal(t, "terrain", result.Items[0].Fields[0].Field)
}

// TestMigrateTilesAndTerrainToCesium_TilesAndTerrain verifies tiles are migrated
// but terrain is left unchanged in the same property.
func TestMigrateTilesAndTerrainToCesium_TilesAndTerrain(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("property").Client()

	doc := mongodoc.PropertyDocument{
		ID: "both1", Scene: "scene1", SchemaPlugin: "reearth", SchemaName: "cesium-beta",
		Items: []*mongodoc.PropertyItemDocument{
			{
				Type: "grouplist", SchemaGroup: "tiles",
				Groups: []*mongodoc.PropertyItemDocument{{
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "tile_type", Type: "string", Value: "default"},
					},
				}},
			},
			{
				Type: "group", SchemaGroup: "terrain",
				Fields: []*mongodoc.PropertyFieldDocument{
					{Field: "terrain", Type: "bool", Value: true},
				},
			},
		},
	}
	_, err := col.InsertOne(ctx, doc)
	require.NoError(t, err)

	require.NoError(t, MigrateTilesAndTerrainToCesium(ctx, client))

	var result mongodoc.PropertyDocument
	err = col.FindOne(ctx, bson.M{"id": "both1"}).Decode(&result)
	require.NoError(t, err)

	require.Len(t, result.Items, 2)
	assert.Equal(t, "google_satellite", result.Items[0].Groups[0].Fields[0].Value.(string))
	assert.Len(t, result.Items[1].Fields, 1, "terrain should be unchanged")
	assert.Equal(t, "terrain", result.Items[1].Fields[0].Field)
}
