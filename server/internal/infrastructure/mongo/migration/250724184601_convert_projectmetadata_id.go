package migration

import (
	"context"
	"fmt"
	"log"

	"github.com/reearth/reearth/server/pkg/id"
	"go.mongodb.org/mongo-driver/bson"
)

func ConvertProjectMetadataId(ctx context.Context, c DBClient) error {
	collection := c.WithCollection("projectmetadata").Client()

	// Find all documents with UUID format IDs (contain dashes)
	filter := bson.M{
		"id": bson.M{
			"$regex": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find project metadata documents with UUID IDs: %w", err)
	}
	defer cursor.Close(ctx)

	var documents []bson.M
	if err := cursor.All(ctx, &documents); err != nil {
		return fmt.Errorf("failed to decode project metadata documents: %w", err)
	}

	log.Printf("Found %d project metadata documents with UUID IDs to convert", len(documents))

	// Convert each UUID ID to ULID
	for _, doc := range documents {
		oldID, ok := doc["id"].(string)
		if !ok {
			continue
		}

		// Generate new ULID
		newID := id.NewProjectMetadataID()

		// Update the document with the new ULID
		updateFilter := bson.M{"id": oldID}
		update := bson.M{
			"$set": bson.M{
				"id": newID.String(),
			},
		}

		result, err := collection.UpdateOne(ctx, updateFilter, update)
		if err != nil {
			return fmt.Errorf("failed to update project metadata ID from %s to %s: %w", oldID, newID.String(), err)
		}

		if result.ModifiedCount > 0 {
			log.Printf("Converted project metadata ID from %s to %s", oldID, newID.String())
		}
	}

	log.Printf("ConvertProjectMetadataId migration completed: converted %d documents", len(documents))
	return nil
}
