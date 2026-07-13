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

// SetTileCategory migrates scene properties by ensuring that any scene with a
// streetView or googleMapSearch widget has a system tile (tile_type=google_satellite,
// tile_category=system). Existing user-added tiles are preserved as-is.
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

	// Collect scene property IDs and widget property IDs, maintaining the
	// relationship so we can carry over legacy tile type to the system tile.
	// sceneToWidgetProps maps scene property ID → widget property IDs.
	var propertyIDs []string
	var widgetPropertyIDs []string
	sceneToWidgetProps := map[string][]string{}
	if err := sceneCol.Find(ctx, sceneFilter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			for _, row := range rows {
				var doc struct {
					Property string `bson:"property"`
					Widgets  []struct {
						Extension string `bson:"extension"`
						Property  string `bson:"property"`
					} `bson:"widgets"`
				}
				if err := bson.Unmarshal(row, &doc); err != nil {
					return fmt.Errorf("failed to unmarshal scene document: %w", err)
				}
				if doc.Property != "" {
					propertyIDs = append(propertyIDs, doc.Property)
				}
				for _, w := range doc.Widgets {
					for _, ext := range streetViewPluginExtensions {
						if w.Extension == ext && w.Property != "" {
							widgetPropertyIDs = append(widgetPropertyIDs, w.Property)
							sceneToWidgetProps[doc.Property] = append(sceneToWidgetProps[doc.Property], w.Property)
						}
					}
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

	// Step 1b: Read legacy tile type from widget properties so it can be
	// carried over to the new system tile (comments 3 & 4).
	// widgetTileTypes maps widget property ID → tile_type value.
	// sceneTileType maps scene property ID → tile_type to use for its system tile.
	propCol := c.WithCollection("property")
	widgetTileTypes := map[string]string{}
	if len(widgetPropertyIDs) > 0 {
		widgetPropReadFilter := bson.M{
			"id": bson.M{"$in": widgetPropertyIDs},
		}
		if err := propCol.Find(ctx, widgetPropReadFilter, &mongox.BatchConsumer{
			Size: 1000,
			Callback: func(rows []bson.Raw) error {
				for _, row := range rows {
					var doc mongodoc.PropertyDocument
					if err := bson.Unmarshal(row, &doc); err != nil {
						continue
					}
					for _, item := range doc.Items {
						if item.SchemaGroup != "tiles" || item.Type != "grouplist" {
							continue
						}
						for _, group := range item.Groups {
							for _, field := range group.Fields {
								if field.Field == "tile_type" {
									if val, ok := field.Value.(string); ok && val != "" {
										widgetTileTypes[doc.ID] = val
									}
								}
							}
						}
					}
				}
				return nil
			},
		}); err != nil {
			return fmt.Errorf("failed to read widget properties: %w", err)
		}
	}

	// Build scene property ID → tile_type from the widget map.
	sceneTileType := map[string]string{}
	for scenePropID, wPropIDs := range sceneToWidgetProps {
		for _, wPropID := range wPropIDs {
			if t, ok := widgetTileTypes[wPropID]; ok {
				sceneTileType[scenePropID] = t
				break // use the first widget's tile type
			}
		}
	}

	// Step 2: Process properties belonging to those scenes.
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
					fmt.Printf("[migration] SetTileCategory: failed to unmarshal property id=%q, skipping: %v\n", raw.ID, err)
					totalFailed++
					continue
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

					// Add the canonical system tile, preserving all existing user-added tiles.
					// Use the tile type from the widget's legacy property if available.
					tileType := "google_satellite"
					if t, ok := sceneTileType[doc.ID]; ok {
						tileType = t
						fmt.Printf("[migration] SetTileCategory: using legacy tile type %q from widget property (scene property %q)\n", tileType, doc.ID)
					}
					newTile := &mongodoc.PropertyItemDocument{
						Type:        "group",
						ID:          id.NewPropertyItemID().String(),
						SchemaGroup: "tiles",
						Fields: []*mongodoc.PropertyFieldDocument{
							{Field: "tile_type", Type: "string", Value: tileType},
							{Field: "tile_category", Type: "string", Value: "system"},
						},
					}
					item.Groups = append(item.Groups, newTile)
					fmt.Printf("[migration] SetTileCategory: added system tile (tile_type=%q) to existing tiles group (property %q)\n", tileType, doc.ID)
					modified = true
				}

				// If no tiles group exists yet, create one containing the system tile.
				if !tilesGroupFound {
					tileType := "google_satellite"
					if t, ok := sceneTileType[doc.ID]; ok {
						tileType = t
						fmt.Printf("[migration] SetTileCategory: using legacy tile type %q from widget property (scene property %q)\n", tileType, doc.ID)
					}
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
									{Field: "tile_type", Type: "string", Value: tileType},
									{Field: "tile_category", Type: "string", Value: "system"},
								},
							},
						},
					}
					doc.Items = append(doc.Items, newTilesGroup)
					fmt.Printf("[migration] SetTileCategory: created tiles group with system tile (tile_type=%q, property %q)\n", tileType, doc.ID)
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
				fmt.Printf("[migration] SetTileCategory: saving scene properties: %v\n", ids)
				return propCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	})

	fmt.Printf("[migration] SetTileCategory: total=%d migrated=%d skipped=%d failed=%d\n",
		totalProcessed, totalMigrated, totalSkipped, totalFailed)
	if err != nil {
		return err
	}

	// Step 3: Remove legacy "tiles" grouplist from streetView/googleMapSearch widget properties.
	// An earlier implementation stored tile configuration directly on the widget property.
	// That data is now managed at the scene level, so we clean up the stale widget property groups.
	if len(widgetPropertyIDs) == 0 {
		fmt.Println("[migration] SetTileCategory: no widget properties to clean up")
		return nil
	}

	fmt.Printf("[migration] SetTileCategory: cleaning up legacy tiles group from %d widget properties\n", len(widgetPropertyIDs))

	widgetPropFilter := bson.M{
		"id": bson.M{"$in": widgetPropertyIDs},
	}

	var widgetCleaned, widgetSkipped int

	err = propCol.Find(ctx, widgetPropFilter, &mongox.BatchConsumer{
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
					fmt.Printf("[migration] SetTileCategory: failed to unmarshal widget property id=%q, skipping: %v\n", raw.ID, err)
					continue
				}

				filtered := doc.Items[:0]
				removed := false
				for _, item := range doc.Items {
					if item.SchemaGroup == "tiles" && item.Type == "grouplist" {
						fmt.Printf("[migration] SetTileCategory: removing legacy tiles group from widget property %q\n", doc.ID)
						removed = true
						continue
					}
					filtered = append(filtered, item)
				}

				if removed {
					doc.Items = filtered
					ids = append(ids, doc.ID)
					newRows = append(newRows, doc)
					widgetCleaned++
				} else {
					widgetSkipped++
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[migration] SetTileCategory: saving widget properties: %v\n", ids)
				return propCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	})

	fmt.Printf("[migration] SetTileCategory: widget properties cleaned=%d skipped=%d\n", widgetCleaned, widgetSkipped)
	return err
}
