package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func AddProjectAlias(ctx context.Context, c DBClient) error {
	projectCollection := c.WithCollection("project").Client()

	cursor, err := projectCollection.Find(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to find documents in project: %w", err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("failed to close cursor for project: %v", err)
		}
	}()

	var updateCount int64
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("failed to decode document: %v", err)
			continue
		}

		id, ok := doc["id"].(string)
		if !ok {
			log.Printf("document missing id field or id is not string: %v", doc["_id"])
			continue
		}

		if _, exists := doc["projectalias"]; exists {
			log.Printf("projectalias already exists for document: %v", doc["_id"])
			continue
		}

		projectalias := "p-" + id

		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$set": bson.M{"projectalias": projectalias}}

		result, err := projectCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Printf("failed to update document %v: %v", doc["_id"], err)
			continue
		}

		if result.ModifiedCount > 0 {
			updateCount++
			log.Printf("added projectalias '%s' to document %v", projectalias, doc["_id"])
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	log.Printf("migration completed: updated %d documents", updateCount)
	return nil
}
