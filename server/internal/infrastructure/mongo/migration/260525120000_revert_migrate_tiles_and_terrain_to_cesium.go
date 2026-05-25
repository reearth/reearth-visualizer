package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

// Reverse mapping: cesium ion asset ID -> original tile type
var cesiumIonAssetToTileType = map[string]string{
	"2":    "default",
	"3":    "default_label",
	"4":    "default_road",
	"3812": "black_marble",
}

// RevertMigrateTilesAndTerrainToCesium reverts the MigrateTilesAndTerrainToCesium migration.
// It converts tiles with type "cesium_ion" and specific asset IDs back to their
// original legacy tile types and removes the cesium_ion_asset_id field.
//
// NOTE: This is a revert/rollback migration and should NOT be added to migrations.go
// unless you need to actually revert the migration in production.
func RevertMigrateTilesAndTerrainToCesium(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	filter := bson.M{
		"items": bson.M{
			"$elemMatch": bson.M{
				"schemagroup": "tiles",
				"groups": bson.M{
					"$elemMatch": bson.M{
						"fields": bson.M{
							"$elemMatch": bson.M{
								"field": "tile_type",
								"value": "cesium_ion",
							},
						},
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
	fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: found %d properties to check\n", n)

	if n == 0 {
		fmt.Println("[revert migration] RevertMigrateTilesAndTerrainToCesium: nothing to do")
		return nil
	}

	var totalProcessed, totalReverted, totalSkipped, totalFailed int

	err = col.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: processing batch of %d properties\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: failed to unmarshal document id=%q: %v\n", raw.ID, err)
					totalFailed++
					return err
				}

				modified := false

				// Iterate through items
				for i := range doc.Items {
					// Handle tiles revert
					if doc.Items[i].SchemaGroup == "tiles" && doc.Items[i].Type == "grouplist" {
						// Iterate through groups (tile instances)
						for j := range doc.Items[i].Groups {
							group := doc.Items[i].Groups[j]

							// Find tile_type and cesium_ion_asset_id fields
							var tileTypeIndex = -1
							var assetIDIndex = -1
							var assetIDValue string

							for k, field := range group.Fields {
								if field.Field == "tile_type" {
									if val, ok := field.Value.(string); ok && val == "cesium_ion" {
										tileTypeIndex = k
									}
								}
								if field.Field == "cesium_ion_asset_id" {
									if val, ok := field.Value.(string); ok {
										assetIDIndex = k
										assetIDValue = val
									}
								}
							}

							// Skip if not a revert target
							// (no cesium_ion tile_type, or no asset_id, or asset_id not in our map)
							if tileTypeIndex == -1 || assetIDIndex == -1 {
								continue
							}

							originalTileType, exists := cesiumIonAssetToTileType[assetIDValue]
							if !exists {
								// This cesium_ion tile has a custom asset ID, not one we migrated
								continue
							}

							// Revert tile_type to original
							group.Fields[tileTypeIndex].Value = originalTileType
							fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: reverting property %q: cesium_ion (asset %s) → %s\n",
								doc.ID, assetIDValue, originalTileType)

							// Remove cesium_ion_asset_id field
							group.Fields = append(group.Fields[:assetIDIndex], group.Fields[assetIDIndex+1:]...)

							modified = true
						}
					}
				}

				totalProcessed++
				if modified {
					ids = append(ids, doc.ID)
					newRows = append(newRows, doc)
					totalReverted++
				} else {
					totalSkipped++
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: saving properties: %v\n", ids)
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})

	fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: total=%d reverted=%d skipped=%d failed=%d\n",
		totalProcessed, totalReverted, totalSkipped, totalFailed)
	return err
}
