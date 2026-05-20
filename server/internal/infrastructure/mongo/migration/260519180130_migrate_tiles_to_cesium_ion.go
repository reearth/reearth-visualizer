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
	filter := bson.M{
		"items": bson.M{
			"$elemMatch": bson.M{
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

	return col.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			fmt.Printf("[migration] MigrateTilesToCesiumIon: processing batch of %d properties\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
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

						if tileTypeIndex == -1 {
							continue
						}

						// Update tile_type to cesium_ion
						group.Fields[tileTypeIndex].Value = "cesium_ion"
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

						fmt.Printf("[migration]   - migrated tile: %s -> cesium_ion (asset_id=%s)\n",
							oldTileType, tileTypeToCesiumIonAsset[oldTileType])
					}
				}

				if modified {
					ids = append(ids, doc.ID)
					newRows = append(newRows, doc)
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[migration] MigrateTilesToCesiumIon: saving %d modified properties\n", len(ids))
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})
}
