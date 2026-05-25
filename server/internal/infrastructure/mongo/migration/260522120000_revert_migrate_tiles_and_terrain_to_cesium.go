package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

// terravistaToLegacyTileType reverses the migration: maps Terravista types back to legacy.
// Note: google_satellite maps back to "default" since both default and default_label
// were migrated to google_satellite, and the original type cannot be recovered.
var terravistaToLegacyTileType = map[string]string{
	"google_satellite":  "default",
	"google_roadmap":    "default_road",
	"nasa_black_marble": "black_marble",
}

// RevertMigrateTilesAndTerrainToCesium reverts the MigrateTilesAndTerrainToCesium migration.
// It converts Terravista tile types (google_satellite, google_roadmap, nasa_black_marble)
// back to their original legacy tile types.
//
// NOTE: This revert is best-effort. google_satellite cannot be distinguished from
// a user-set value vs a migrated value. Use only in emergency rollback scenarios.
//
// This is a revert/rollback migration and should NOT be added to migrations.go
// unless you need to actually revert the migration in production.
func RevertMigrateTilesAndTerrainToCesium(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	filter := bson.M{
		"items": bson.M{
			"$elemMatch": bson.M{
				"schemagroup": "tiles",
				"groups.fields": bson.M{
					"$elemMatch": bson.M{
						"field": "tile_type",
						"value": bson.M{
							"$in": []string{"google_satellite", "google_roadmap", "nasa_black_marble"},
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

				for i := range doc.Items {
					if doc.Items[i].SchemaGroup != "tiles" || doc.Items[i].Type != "grouplist" {
						continue
					}

					for j := range doc.Items[i].Groups {
						group := doc.Items[i].Groups[j]

						tileTypeIdx := -1
						var currentType string

						for k, field := range group.Fields {
							if field.Field == "tile_type" {
								if val, ok := field.Value.(string); ok {
									if _, isTarget := terravistaToLegacyTileType[val]; isTarget {
										tileTypeIdx = k
										currentType = val
									}
								}
								break
							}
						}

						if tileTypeIdx == -1 {
							continue
						}

						originalType := terravistaToLegacyTileType[currentType]
						group.Fields[tileTypeIdx].Value = originalType
						fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: %s -> %s (property %q)\n",
							currentType, originalType, doc.ID)
						modified = true
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
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})

	fmt.Printf("[revert migration] RevertMigrateTilesAndTerrainToCesium: total=%d reverted=%d skipped=%d failed=%d\n",
		totalProcessed, totalReverted, totalSkipped, totalFailed)
	return err
}
