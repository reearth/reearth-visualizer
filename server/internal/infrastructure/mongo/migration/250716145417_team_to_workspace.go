package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func TeamToWorkspace(ctx context.Context, c DBClient) error {

	filter := bson.M{"team": bson.M{"$exists": true}}
	update := bson.M{
		"$rename": bson.M{
			"team": "workspace",
		},
	}

	projectCollection := c.WithCollection("project").Client()
	result, err := projectCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update documents: %w", err)
	}
	log.Printf("bulk migration completed: updated %d documents", result.ModifiedCount)

	sceneCollection := c.WithCollection("scene").Client()
	result, err = sceneCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update documents: %w", err)
	}
	log.Printf("bulk migration completed: updated %d documents", result.ModifiedCount)

	assetCollection := c.WithCollection("asset").Client()
	result, err = assetCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update documents: %w", err)
	}
	log.Printf("bulk migration completed: updated %d documents", result.ModifiedCount)

	return nil
}
