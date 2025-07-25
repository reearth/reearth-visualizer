package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
)

func ConverEmptyProjectAlias(ctx context.Context, c DBClient) error {
	col := c.WithCollection("project").Client()

	cursor, err := col.Find(ctx, bson.M{})
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

		// Check if projectalias exists and is not empty
		if alias, exists := doc["projectalias"]; exists {
			if aliasStr, ok := alias.(string); ok && aliasStr != "" {
				log.Printf("projectalias already exists and is not empty for document: %v", doc["_id"])
				continue
			}
		}

		projectalias := "p-" + id

		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$set": bson.M{"projectalias": projectalias}}

		result, err := col.UpdateOne(ctx, filter, update)
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
