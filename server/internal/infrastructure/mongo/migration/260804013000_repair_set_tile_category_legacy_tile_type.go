package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

// RepairSetTileCategoryLegacyTileType repairs scene properties that SetTileCategory
// (260804000000) processed incorrectly. That migration only recognized a widget's
// legacy tiles setting when stored as a "grouplist", but the streetView widget's
// tiles schema historically had no list:true and so persisted as a plain "group".
// Scenes hit by that gap ended up with the "google_satellite" default instead of
// their real legacy tile_type, and the leftover widget-level tiles item was never
// cleaned up.
//
// This migration re-derives the correct tile_type from any remaining "group"-shaped
// widget tiles item, corrects the scene property's system tile, and removes the
// leftover widget property item. It is a no-op once no "group"-shaped widget tiles
// items remain, so it is safe to run repeatedly.
func RepairSetTileCategoryLegacyTileType(ctx context.Context, c DBClient) error {
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

	sceneToWidgetProps := map[string][]string{}
	var widgetPropertyIDs []string
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
				if doc.Property == "" {
					continue
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

	if len(widgetPropertyIDs) == 0 {
		fmt.Println("[migration] RepairSetTileCategoryLegacyTileType: no streetView/googleMapSearch widgets found, nothing to do")
		return nil
	}

	propCol := c.WithCollection("property")

	// Find widget properties still holding a "group"-shaped legacy tiles item -
	// these are exactly the ones SetTileCategory failed to read and clean up.
	// Keyed by property ID so a document with more than one matching item (or a
	// re-scanned document) is only ever counted once.
	widgetTileTypes := map[string]string{}
	if err := propCol.Find(ctx, bson.M{"id": bson.M{"$in": widgetPropertyIDs}}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: failed to unmarshal widget property id=%q, skipping: %v\n", raw.ID, err)
					continue
				}
				for _, item := range doc.Items {
					if item.SchemaGroup != "tiles" || item.Type != "group" {
						continue
					}
					if val, ok := tileTypeFromTilesItem(item); ok {
						widgetTileTypes[doc.ID] = val
					}
				}
			}
			return nil
		},
	}); err != nil {
		return fmt.Errorf("failed to read widget properties: %w", err)
	}

	if len(widgetTileTypes) == 0 {
		fmt.Println("[migration] RepairSetTileCategoryLegacyTileType: no leftover group-shaped widget tiles found, nothing to do")
		return nil
	}
	fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: found %d widget properties with leftover group-shaped tiles\n", len(widgetTileTypes))

	affectedWidgetPropertyIDs := make([]string, 0, len(widgetTileTypes))
	for wPropID := range widgetTileTypes {
		affectedWidgetPropertyIDs = append(affectedWidgetPropertyIDs, wPropID)
	}

	// Map affected scene property ID -> correct tile_type.
	sceneTileType := map[string]string{}
	for scenePropID, wPropIDs := range sceneToWidgetProps {
		for _, wPropID := range wPropIDs {
			if t, ok := widgetTileTypes[wPropID]; ok {
				sceneTileType[scenePropID] = t
				break // use the first widget's tile type
			}
		}
	}

	scenePropertyIDs := make([]string, 0, len(sceneTileType))
	for scenePropID := range sceneTileType {
		scenePropertyIDs = append(scenePropertyIDs, scenePropID)
	}

	var totalFixed, totalSkipped int
	if err := propCol.Find(ctx, bson.M{"id": bson.M{"$in": scenePropertyIDs}}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]any, 0, len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: failed to unmarshal scene property id=%q, skipping: %v\n", raw.ID, err)
					continue
				}

				correctTileType, ok := sceneTileType[doc.ID]
				if !ok {
					continue
				}

				fixed := false
				for _, item := range doc.Items {
					if item.SchemaGroup != "tiles" || item.Type != "grouplist" {
						continue
					}
					for _, group := range item.Groups {
						isSystem := false
						for _, field := range group.Fields {
							if field.Field == "tile_category" {
								if v, ok := field.Value.(string); ok && v == "system" {
									isSystem = true
								}
							}
						}
						if !isSystem {
							continue
						}
						for _, field := range group.Fields {
							if field.Field != "tile_type" {
								continue
							}
							if v, ok := field.Value.(string); ok && v != correctTileType {
								fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: correcting property %q tile_type %q -> %q\n", doc.ID, v, correctTileType)
								field.Value = correctTileType
								fixed = true
							}
						}
					}
				}

				if fixed {
					ids = append(ids, doc.ID)
					newRows = append(newRows, doc)
					totalFixed++
				} else {
					totalSkipped++
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: saving scene properties: %v\n", ids)
				return propCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	}); err != nil {
		return fmt.Errorf("failed to repair scene properties: %w", err)
	}
	fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: scene properties fixed=%d skipped=%d\n", totalFixed, totalSkipped)

	// Now that the value has been carried over, remove the leftover group-shaped
	// widget tiles items.
	var widgetCleaned int
	if err := propCol.Find(ctx, bson.M{"id": bson.M{"$in": affectedWidgetPropertyIDs}}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]any, 0, len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					var raw struct {
						ID string `bson:"id"`
					}
					_ = bson.Unmarshal(row, &raw)
					fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: failed to unmarshal widget property id=%q, skipping: %v\n", raw.ID, err)
					continue
				}

				filtered := doc.Items[:0]
				removed := false
				for _, item := range doc.Items {
					if item.SchemaGroup == "tiles" && item.Type == "group" {
						val, _ := tileTypeFromTilesItem(item)
						fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: widget property %q had tile_type=%q before removal\n", doc.ID, val)
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
				}
			}

			if len(ids) > 0 {
				fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: saving widget properties: %v\n", ids)
				return propCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	}); err != nil {
		return fmt.Errorf("failed to clean up widget properties: %w", err)
	}
	fmt.Printf("[migration] RepairSetTileCategoryLegacyTileType: widget properties cleaned=%d\n", widgetCleaned)

	return nil
}
