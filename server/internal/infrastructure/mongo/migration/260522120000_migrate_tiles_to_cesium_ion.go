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

func MigrateTilesToCesiumIon(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	// Find all properties with tiles that need migration
	// This includes:
	// 1. Tiles with explicit tile_type in [default, default_label, default_road, black_marble]
	// 2. Tiles with empty fields array (were using old default "default")
	filter := bson.M{
		"items": bson.M{
			"$elemMatch": bson.M{
				"schemagroup": "tiles",
				"$or": []bson.M{
					// Case 1: Explicit old tile types
					{
						"groups.fields": bson.M{
							"$elemMatch": bson.M{
								"field": "tile_type",
								"value": bson.M{
									"$in": []string{"default", "default_label", "default_road", "black_marble"},
								},
							},
						},
					},
					// Case 2: Empty fields array (using old default)
					{
						"groups": bson.M{
							"$elemMatch": bson.M{
								"fields": bson.M{"$size": 0},
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
	fmt.Printf("[migration] MigrateTilesToCesiumIon: found %d properties to migrate\n", n)

	if n == 0 {
		fmt.Println("[migration] MigrateTilesToCesiumIon: nothing to do")
		return nil
	}

	var totalProcessed, totalMigrated, totalSkipped, totalFailed int

	err = col.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			fmt.Printf("[migration] MigrateTilesToCesiumIon: processing batch of %d properties\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[migration] MigrateTilesToCesiumIon: failed to unmarshal document id=%q: %v\n", raw.ID, err)
					totalFailed++
					return err
				}

				modified := false

				// Iterate through items
				for i := range doc.Items {
					if doc.Items[i].SchemaGroup != "tiles" {
						continue
					}

					// Only process grouplist type (tiles is a list)
					if doc.Items[i].Type != "grouplist" {
						continue
					}

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
				fmt.Printf("[migration] MigrateTilesToCesiumIon: saving properties: %v\n", ids)
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})

	fmt.Printf("[migration] MigrateTilesToCesiumIon: total=%d migrated=%d skipped=%d failed=%d\n",
		totalProcessed, totalMigrated, totalSkipped, totalFailed)
	return err
}
