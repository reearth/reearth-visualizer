package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	timelineBatchSize = 100
)

func RemoveTimeline(ctx context.Context, c DBClient) error {
	// Step 1: Delete all properties with schemaname: "timeline"
	if err := deleteTimelineProperties(ctx, c); err != nil {
		return fmt.Errorf("failed to delete timeline properties: %w", err)
	}

	// Step 2: Remove timeline widgets from scenes
	if err := removeTimelineWidgetsFromScenes(ctx, c); err != nil {
		return fmt.Errorf("failed to remove timeline widgets from scenes: %w", err)
	}

	return nil
}

func deleteTimelineProperties(ctx context.Context, c DBClient) error {
	collection := c.WithCollection("property").Client()

	filter := bson.M{
		"schemaplugin": "reearth",
		"schemaname":   "timeline",
	}

	result, err := collection.DeleteMany(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to delete timeline properties: %w", err)
	}

	log.Printf("Deleted %d timeline properties\n", result.DeletedCount)
	return nil
}

func removeTimelineWidgetsFromScenes(ctx context.Context, c DBClient) error {
	collection := c.WithCollection("scene").Client()

	// Find all scenes with widgets
	filter := bson.M{
		"widgets": bson.M{"$exists": true, "$ne": nil},
	}

	opts := options.Find().SetBatchSize(timelineBatchSize)
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return fmt.Errorf("failed to find scenes: %w", err)
	}
	defer func() {
		if closeErr := cursor.Close(ctx); closeErr != nil {
			log.Printf("Error closing cursor: %v\n", closeErr)
		}
	}()

	var batch []bson.M
	for cursor.Next(ctx) {
		var scene bson.M
		if err := cursor.Decode(&scene); err != nil {
			log.Printf("Error decoding scene: %v\n", err)
			continue
		}

		batch = append(batch, scene)
		if len(batch) >= timelineBatchSize {
			if err := processTimelineSceneBatch(ctx, collection, batch); err != nil {
				log.Printf("Error processing batch: %v\n", err)
			}
			batch = nil
		}
	}

	if len(batch) > 0 {
		if err := processTimelineSceneBatch(ctx, collection, batch); err != nil {
			log.Printf("Error processing final batch: %v\n", err)
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	return nil
}

func processTimelineSceneBatch(ctx context.Context, collection *mongo.Collection, batch []bson.M) error {
	for _, scene := range batch {
		sceneID, ok := scene["id"].(string)
		if !ok {
			continue
		}

		widgets, ok := scene["widgets"].(bson.A)
		if !ok {
			continue
		}

		// Find timeline widget IDs to remove
		var timelineWidgetIDs []string
		var newWidgets bson.A

		for _, w := range widgets {
			widget, ok := w.(bson.M)
			if !ok {
				newWidgets = append(newWidgets, w)
				continue
			}

			extension, ok := widget["extension"].(string)
			if ok && extension == "timeline" {
				// This is a timeline widget, collect its ID
				if widgetID, ok := widget["id"].(string); ok {
					timelineWidgetIDs = append(timelineWidgetIDs, widgetID)
				}
				// Skip adding to newWidgets (effectively removing it)
				continue
			}

			newWidgets = append(newWidgets, widget)
		}

		// If no timeline widgets found, skip this scene
		if len(timelineWidgetIDs) == 0 {
			continue
		}

		log.Printf("Removing %d timeline widget(s) from scene %s\n", len(timelineWidgetIDs), sceneID)

		// Update widgets array and alignsystems
		update := bson.M{
			"$set": bson.M{
				"widgets": newWidgets,
			},
		}

		// Remove widget IDs from alignsystems
		if alignsystems, ok := scene["alignsystems"].(bson.M); ok {
			cleanedAlignSystems := removeWidgetIDsFromAlignSystems(alignsystems, timelineWidgetIDs)
			update["$set"].(bson.M)["alignsystems"] = cleanedAlignSystems
		}

		// Update the scene
		filter := bson.M{"id": sceneID}
		if _, err := collection.UpdateOne(ctx, filter, update); err != nil {
			log.Printf("Failed to update scene %s: %v\n", sceneID, err)
			continue
		}
	}

	return nil
}

func removeWidgetIDsFromAlignSystems(alignsystems bson.M, widgetIDsToRemove []string) bson.M {
	// Create a map for faster lookup
	toRemove := make(map[string]bool)
	for _, id := range widgetIDsToRemove {
		toRemove[id] = true
	}

	// Iterate through align systems (desktop, mobile, etc.)
	for systemKey, systemValue := range alignsystems {
		system, ok := systemValue.(bson.M)
		if !ok {
			continue
		}

		// Iterate through zones (inner, outer)
		for zoneKey, zoneValue := range system {
			zone, ok := zoneValue.(bson.M)
			if !ok {
				continue
			}

			// Iterate through sections (left, center, right)
			for sectionKey, sectionValue := range zone {
				section, ok := sectionValue.(bson.M)
				if !ok {
					continue
				}

				// Iterate through areas (top, middle, bottom)
				for areaKey, areaValue := range section {
					area, ok := areaValue.(bson.M)
					if !ok {
						continue
					}

					// Process widgetids array
					if widgetIDs, ok := area["widgetids"].(bson.A); ok {
						var newWidgetIDs bson.A
						for _, wid := range widgetIDs {
							if widgetIDStr, ok := wid.(string); ok {
								if !toRemove[widgetIDStr] {
									newWidgetIDs = append(newWidgetIDs, widgetIDStr)
								}
							}
						}
						area["widgetids"] = newWidgetIDs
					}

					section[areaKey] = area
				}

				zone[sectionKey] = section
			}

			system[zoneKey] = zone
		}

		alignsystems[systemKey] = system
	}

	return alignsystems
}
