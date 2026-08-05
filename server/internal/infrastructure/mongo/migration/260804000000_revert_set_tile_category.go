package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

// RevertSetTileCategory reverts the SetTileCategory migration by removing system tiles
// (tile_category=system) from scene property tile groups. If removing the system tile
// leaves the tiles grouplist empty, the entire grouplist item is removed from doc.Items.
//
// NOTE: Widget property data (the legacy tiles grouplist that was cleaned up during
// SetTileCategory) cannot be restored by this revert migration.
func RevertSetTileCategory(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	filter := bson.M{
		"items": bson.M{
			"$elemMatch": bson.M{
				"schemagroup": "tiles",
				"groups": bson.M{
					"$elemMatch": bson.M{
						"fields": bson.M{
							"$elemMatch": bson.M{
								"field": "tile_category",
								"value": "system",
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
	fmt.Printf("[revert migration] RevertSetTileCategory: found %d properties to check\n", n)

	if n == 0 {
		fmt.Println("[revert migration] RevertSetTileCategory: nothing to do")
		return nil
	}

	var totalProcessed, totalReverted, totalSkipped, totalFailed int

	err = col.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			fmt.Printf("[revert migration] RevertSetTileCategory: processing batch of %d properties\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[revert migration] RevertSetTileCategory: failed to unmarshal document id=%q: %v\n", raw.ID, err)
					totalFailed++
					return err
				}

				modified := false

				// Build a new items slice, filtering system tiles from any tiles grouplist.
				newItems := make([]*mongodoc.PropertyItemDocument, 0, len(doc.Items))
				for _, item := range doc.Items {
					if item.SchemaGroup != "tiles" || item.Type != "grouplist" {
						newItems = append(newItems, item)
						continue
					}

					// Filter out groups that have tile_category=system.
					filteredGroups := item.Groups[:0]
					for _, group := range item.Groups {
						isSystem := false
						for _, field := range group.Fields {
							if field.Field == "tile_category" {
								if val, ok := field.Value.(string); ok && val == "system" {
									isSystem = true
									break
								}
							}
						}
						if isSystem {
							fmt.Printf("[revert migration] RevertSetTileCategory: removing system tile from property %q\n", doc.ID)
							modified = true
						} else {
							filteredGroups = append(filteredGroups, group)
						}
					}

					// Only keep the grouplist item if it still has groups after removal.
					if len(filteredGroups) > 0 {
						item.Groups = filteredGroups
						newItems = append(newItems, item)
					} else if modified {
						// The grouplist is now empty — drop the entire item.
						fmt.Printf("[revert migration] RevertSetTileCategory: tiles grouplist is now empty, removing from property %q\n", doc.ID)
					}
				}

				totalProcessed++
				if modified {
					doc.Items = newItems
					ids = append(ids, doc.ID)
					newRows = append(newRows, doc)
					totalReverted++
				} else {
					totalSkipped++
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[revert migration] RevertSetTileCategory: saving properties: %v\n", ids)
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})

	fmt.Printf("[revert migration] RevertSetTileCategory: total=%d reverted=%d skipped=%d failed=%d\n",
		totalProcessed, totalReverted, totalSkipped, totalFailed)
	return err
}
