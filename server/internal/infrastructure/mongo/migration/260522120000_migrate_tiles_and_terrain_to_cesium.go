package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

// legacyTileTypeToTerravista maps explicit legacy tile types to their Terravista equivalents.
var legacyTileTypeToTerravista = map[string]string{
	"default":       "google_satellite",
	"default_label": "google_satellite",
	"default_road":  "google_roadmap",
	"black_marble":  "nasa_black_marble",
}

// MigrateTilesAndTerrainToCesium migrates legacy tile types to Terravista equivalents.
//
// Only tiles with an explicit legacy tile_type are migrated:
//   - default, default_label -> google_satellite
//   - default_road           -> google_roadmap
//   - black_marble           -> nasa_black_marble
//
// Tiles with no tile_type (empty fields) and terrain items are intentionally left unchanged.
func MigrateTilesAndTerrainToCesium(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

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

				for i := range doc.Items {
					if doc.Items[i].SchemaGroup != "tiles" || doc.Items[i].Type != "grouplist" {
						continue
					}

					for j := range doc.Items[i].Groups {
						group := doc.Items[i].Groups[j]

						tileTypeIdx := -1
						var oldTileType string

						for k, field := range group.Fields {
							if field.Field == "tile_type" {
								if val, ok := field.Value.(string); ok {
									if _, isLegacy := legacyTileTypeToTerravista[val]; isLegacy {
										tileTypeIdx = k
										oldTileType = val
									}
								}
								break
							}
						}

						if tileTypeIdx == -1 {
							continue
						}

						newType := legacyTileTypeToTerravista[oldTileType]
						group.Fields[tileTypeIdx].Value = newType
						fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: %s -> %s (property %q)\n", oldTileType, newType, doc.ID)
						modified = true
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
				return col.SaveAll(ctx, ids, newRows)
			}

			return nil
		},
	})

	fmt.Printf("[migration] MigrateTilesAndTerrainToCesium: total=%d migrated=%d skipped=%d failed=%d\n",
		totalProcessed, totalMigrated, totalSkipped, totalFailed)
	return err
}
