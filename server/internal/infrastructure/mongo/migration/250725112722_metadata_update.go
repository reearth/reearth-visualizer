package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func MetadataUpdate(ctx context.Context, c DBClient) error {
	projectmetadataCollection := c.WithCollection("projectmetadata").Client()
	projectCollection := c.WithCollection("project").Client()

	filter := bson.M{
		"$or": []bson.M{
			{"workspace": bson.M{"$exists": false}},
			{"workspace": nil},
			{"workspace": ""},
		},
	}

	cursor, err := projectmetadataCollection.Find(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find projectmetadata records: %w", err)
	}
	defer cursor.Close(ctx)

	var updatedCount int64
	var errorCount int64

	for cursor.Next(ctx) {
		var metadata bson.M
		if err := cursor.Decode(&metadata); err != nil {
			log.Printf("failed to decode projectmetadata record: %v", err)
			errorCount++
			continue
		}

		projectID, ok := metadata["project"].(string)
		if !ok {
			log.Printf("projectmetadata record %v has invalid or missing project field", metadata["_id"])
			errorCount++
			continue
		}

		var project bson.M
		err := projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&project)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				log.Printf("project with id %s not found for projectmetadata %v", projectID, metadata["_id"])
			} else {
				log.Printf("failed to find project %s: %v", projectID, err)
			}
			errorCount++
			continue
		}

		workspace, ok := project["workspace"].(string)
		if !ok || workspace == "" {
			log.Printf("project %s has invalid or empty workspace field", projectID)
			errorCount++
			continue
		}

		update := bson.M{
			"$set": bson.M{
				"workspace": workspace,
			},
		}

		result, err := projectmetadataCollection.UpdateOne(
			ctx,
			bson.M{"_id": metadata["_id"]},
			update,
		)
		if err != nil {
			log.Printf("failed to update projectmetadata %v: %v", metadata["_id"], err)
			errorCount++
			continue
		}

		if result.ModifiedCount > 0 {
			updatedCount++
			log.Printf("updated projectmetadata %v with workspace %s", metadata["_id"], workspace)
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	log.Printf("Migration completed: %d records updated, %d errors", updatedCount, errorCount)

	if errorCount > 0 {
		return fmt.Errorf("migration completed with %d errors", errorCount)
	}

	return nil
}
