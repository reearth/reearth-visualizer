package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

var tileTypeToCesiumIonAsset = map[string]string{
	"default":       "2",
	"default_label": "3",
	"default_road":  "4",
	"black_marble":  "3812",
}

// MigrateTilesAndTerrainToCesium migrates legacy tile configurations to Cesium Ion
// and adds default terrain type for enabled terrain without explicit type.
//
// This migration performs two operations:
// 1. Tiles: Converts legacy tile types (default, default_label, default_road, black_marble)
//    to cesium_ion with appropriate asset IDs
// 2. Terrain: Adds terrainType="cesium" when terrain is enabled but no type is specified
func MigrateTilesAndTerrainToCesium(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	// Find all properties with tiles or terrain that need migration
	// This includes:
	// 1. Tiles with explicit tile_type in [default, default_label, default_road, black_marble]
	// 2. Tiles with empty fields array (were using old default "default")
	// 3. Terrain enabled (terrain=true) but missing terrainType field
	filter := bson.M{
		"items": bson.M{
			"$elemMatch": bson.M{
				"$or": []bson.M{
					// Case 1: Tiles with old tile types
					{
						"schemagroup": "tiles",
						"groups.fields": bson.M{
							"$elemMatch": bson.M{
								"field": "tile_type",
								"value": bson.M{
									"$in": []string{"default", "default_label", "default_road", "black_marble"},
								},
							},
						},
					},
					// Case 2: Tiles with empty fields array (using old default)
					{
						"schemagroup": "tiles",
						"groups": bson.M{
							"$elemMatch": bson.M{
								"fields": bson.M{"$size": 0},
							},
						},
					},
					// Case 3: Terrain enabled but no terrainType field
					{
						"schemagroup": "terrain",
						"type":        "group",
						"fields": bson.M{
							"$elemMatch": bson.M{
								"field": "terrain",
								"value": true,
							},
						},
						"fields.field": bson.M{"$ne": "terrainType"},
					},
				},
			},
		},
	}

	countCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	n, err := col.Client().CountDocuments(countCtx, filter)
	if err != nil {
		return fmt.Errorf("count failed: %w", err)
	}
	fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: found %d properties to migrate\n", n)

	if n == 0 {
		fmt.Println("[migration] MigrateTilesAndTerrainToCesium: nothing to do")
		return nil
	}

	var totalProcessed, totalMigrated, totalSkipped, totalFailed int

	err = col.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: processing batch of %d properties\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: failed to unmarshal document id=%q: %v\n", raw.ID, err)
					totalFailed++
					return err
				}

				modified := false

				// Iterate through items
				for i := range doc.Items {
					// Handle tiles migration
					if doc.Items[i].SchemaGroup == "tiles" && doc.Items[i].Type == "grouplist" {
						// Iterate through groups (tile instances)
						for j := range doc.Items[i].Groups {
							group := doc.Items[i].Groups[j]

							// Find tile_type field
							var tileTypeIndex = -1
							var oldTileType string
							var isEmptyFields = len(group.Fields) == 0

							for k, field := range group.Fields {
								if field.Field == "tile_type" {
									if val, ok := field.Value.(string); ok {
										if _, exists := tileTypeToCesiumIonAsset[val]; exists {
											tileTypeIndex = k
											oldTileType = val
											break
										}
									}
								}
							}

							// Skip if not a migration target
							// (has tile_type but it's not in our migration list, and fields is not empty)
							if tileTypeIndex == -1 && !isEmptyFields {
								continue
							}

							// Determine the old tile type
							if isEmptyFields {
								// Empty fields means it was using the old default "default"
								oldTileType = "default"
							}

							// Update or add tile_type field
							if tileTypeIndex != -1 {
								// Update existing tile_type field
								group.Fields[tileTypeIndex].Value = "cesium_ion"
							} else {
								// Add new tile_type field (for empty fields case)
								group.Fields = append(group.Fields, &mongodoc.PropertyFieldDocument{
									Field: "tile_type",
									Type:  "string",
									Value: "cesium_ion",
								})
							}
							modified = true

							// Check if cesium_ion_asset_id already exists
							assetIDExists := false
							for k := range group.Fields {
								if group.Fields[k].Field == "cesium_ion_asset_id" {
									// Update existing value
									group.Fields[k].Value = tileTypeToCesiumIonAsset[oldTileType]
									assetIDExists = true
									break
								}
							}

							// Add cesium_ion_asset_id if it doesn't exist
							if !assetIDExists {
								group.Fields = append(group.Fields, &mongodoc.PropertyFieldDocument{
									Field: "cesium_ion_asset_id",
									Type:  "string",
									Value: tileTypeToCesiumIonAsset[oldTileType],
								})
							}
						}
					}

					// Handle terrain migration
					if doc.Items[i].SchemaGroup == "terrain" && doc.Items[i].Type == "group" {
						// Check if terrain is enabled and terrainType is missing
						var terrainEnabled bool
						var hasTerrainType bool

						for _, field := range doc.Items[i].Fields {
							if field.Field == "terrain" {
								if val, ok := field.Value.(bool); ok && val {
									terrainEnabled = true
								}
							}
							if field.Field == "terrainType" {
								hasTerrainType = true
							}
						}

						// If terrain is enabled but terrainType is missing, add it
						if terrainEnabled && !hasTerrainType {
							doc.Items[i].Fields = append(doc.Items[i].Fields, &mongodoc.PropertyFieldDocument{
								Field: "terrainType",
								Type:  "string",
								Value: "cesium",
							})
							modified = true
							fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: adding terrainType to property %q\n", doc.ID)
						}
					}
				}

				totalProcessed++
				if modified {
					ids = append(ids, doc.ID)
					newRows = append(newRows, doc)
					totalMigrated++
				} else {
					totalSkipped++
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: saving properties: %v\n", ids)
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})

	fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: total=%d migrated=%d skipped=%d failed=%d\n",
		totalProcessed, totalMigrated, totalSkipped, totalFailed)
	return err
}
