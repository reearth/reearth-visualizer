package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func SetVisibilityPublic(ctx context.Context, c DBClient) error {
	projectCollection := c.WithCollection("project").Client()

	filter := bson.M{}

	update := bson.M{
		"$set": bson.M{
			"visibility": "public",
		},
	}

	result, err := projectCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update project visibility: %w", err)
	}

	log.Printf("Updated %d project(s) visibility to public", result.ModifiedCount)

	return nil
}
