package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

// streetViewPluginExtensions are the built-in widget extension IDs that require
// Google Maps tiles to function. Scenes containing any of these widgets should
// have a system tile (tile_type=google_satellite, tile_category=system).
var streetViewPluginExtensions = []string{"streetView", "googleMapSearch"}

// streetViewLegacyTileTypes are tile types that were previously used as dedicated
// Street View tiles without a tile_category. They are removed and replaced by the
// canonical system tile during migration.
var streetViewLegacyTileTypes = map[string]bool{
	"google_satellite": true,
	"google_roadmap":   true,
}

// SetTileCategory migrates scene properties by ensuring that any scene with a
// streetView or googleMapSearch widget has a system tile (tile_type=google_satellite,
// tile_category=system). Legacy tile entries that have tile_type=google_satellite or
// google_roadmap without a tile_category are removed before the system tile is added.
func SetTileCategory(ctx context.Context, c DBClient) error {
	// Step 1: Find all scenes that have a streetView or googleMapSearch widget.
	sceneCol := c.WithCollection("scene")

	sceneFilter := bson.M{
		"widgets": bson.M{
			"$elemMatch": bson.M{
				"extension": bson.M{
					"$in": streetViewPluginExtensions,
				},
			},
		},
	}

	countCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	n, err := sceneCol.Client().CountDocuments(countCtx, sceneFilter)
	if err != nil {
		return fmt.Errorf("count scenes failed: %w", err)
	}
	fmt.Printf("[migration] SetTileCategory: found %d scenes with streetView or googleMapSearch widgets\n", n)

	if n == 0 {
		fmt.Println("[migration] SetTileCategory: nothing to do")
		return nil
	}

	// Collect the property IDs of the matching scenes.
	var propertyIDs []string
	if err := sceneCol.Find(ctx, sceneFilter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			for _, row := range rows {
				var doc struct {
					Property string `bson:"property"`
				}
				if err := bson.Unmarshal(row, &doc); err != nil {
					return fmt.Errorf("failed to unmarshal scene document: %w", err)
				}
				if doc.Property != "" {
					propertyIDs = append(propertyIDs, doc.Property)
				}
			}
			return nil
		},
	}); err != nil {
		return fmt.Errorf("failed to query scenes: %w", err)
	}

	if len(propertyIDs) == 0 {
		fmt.Println("[migration] SetTileCategory: no property IDs found, nothing to do")
		return nil
	}

	fmt.Printf("[migration] SetTileCategory: processing %d scene properties\n", len(propertyIDs))

	// Step 2: Process properties belonging to those scenes.
	propCol := c.WithCollection("property")
	propFilter := bson.M{
		"id": bson.M{"$in": propertyIDs},
	}

	var totalProcessed, totalMigrated, totalSkipped, totalFailed int

	err = propCol.Find(ctx, propFilter, &mongox.BatchConsumer{
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
					fmt.Printf("[migration] SetTileCategory: failed to unmarshal property id=%q: %v\n", raw.ID, err)
					totalFailed++
					return err
				}

				modified := false
				tilesGroupFound := false

				for i := range doc.Items {
					item := doc.Items[i]
					if item.SchemaGroup != "tiles" || item.Type != "grouplist" {
						continue
					}
					tilesGroupFound = true

					// Skip if a system tile already exists.
					hasSystemTile := false
					for _, group := range item.Groups {
						for _, field := range group.Fields {
							if field.Field == "tile_category" {
								if val, ok := field.Value.(string); ok && val == "system" {
									hasSystemTile = true
								}
							}
						}
					}
					if hasSystemTile {
						fmt.Printf("[migration] SetTileCategory: property %q already has a system tile, skipping\n", doc.ID)
						continue
					}

					// Remove legacy Street View tiles that lack tile_category.
					kept := make([]*mongodoc.PropertyItemDocument, 0, len(item.Groups))
					removedAny := false
					for _, group := range item.Groups {
						tileType := ""
						hasTileCategory := false
						for _, field := range group.Fields {
							switch field.Field {
							case "tile_type":
								if val, ok := field.Value.(string); ok {
									tileType = val
								}
							case "tile_category":
								if val, ok := field.Value.(string); ok && val != "" {
									hasTileCategory = true
								}
							}
						}
						if streetViewLegacyTileTypes[tileType] && !hasTileCategory {
							fmt.Printf("[migration] SetTileCategory: removing legacy tile tile_type=%q (property %q)\n",
								tileType, doc.ID)
							removedAny = true
							continue
						}
						kept = append(kept, group)
					}

					// Add the canonical system tile.
					newTile := &mongodoc.PropertyItemDocument{
						Type:        "group",
						ID:          id.NewPropertyItemID().String(),
						SchemaGroup: "tiles",
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: "google_satellite"},
							{Field: "tile_category", Type: "string", Value: "system"},
						},
					}
					item.Groups = append(kept, newTile)

					if removedAny {
						fmt.Printf("[migration] SetTileCategory: replaced legacy tiles with system tile (property %q)\n", doc.ID)
					} else {
						fmt.Printf("[migration] SetTileCategory: added system tile to existing tiles group (property %q)\n", doc.ID)
					}
					modified = true
				}

				// If no tiles group exists yet, create one containing the system tile.
				if !tilesGroupFound {
					newTilesGroup := &mongodoc.PropertyItemDocument{
						Type:        "grouplist",
						ID:          id.NewPropertyItemID().String(),
						SchemaGroup: "tiles",
						Groups: []*mongodoc.PropertyItemDocument{
							{
								Type:        "group",
								ID:          id.NewPropertyItemID().String(),
								SchemaGroup: "tiles",
								Fields: []*mongodoc.PropertyFieldDocument{
									{Field: "tile_type", Type: "string", Value: "google_satellite"},
									{Field: "tile_category", Type: "string", Value: "system"},
								},
							},
						},
					}
					doc.Items = append(doc.Items, newTilesGroup)
					fmt.Printf("[migration] SetTileCategory: created tiles group with system tile (property %q)\n", doc.ID)
					modified = true
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
				return propCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	})

	fmt.Printf("[migration] SetTileCategory: total=%d migrated=%d skipped=%d failed=%d\n",
		totalProcessed, totalMigrated, totalSkipped, totalFailed)
	return err
}
