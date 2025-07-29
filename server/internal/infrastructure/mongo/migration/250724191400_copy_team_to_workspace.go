package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func CopyTeamToWorkspace(ctx context.Context, c DBClient) error {
	// Define collections that need workspace to team copy
	collections := []string{"project", "scene", "asset"}

	for _, collectionName := range collections {
		collection := c.WithCollection(collectionName).Client()

		// Find documents that have a team field but no workspace field
		filter := bson.M{
			"team":      bson.M{"$exists": true},
			"workspace": bson.M{"$exists": false},
		}

		// Copy team value to workspace field
		update := []bson.M{
			{
				"$set": bson.M{
					"workspace": "$team",
				},
			},
		}

		result, err := collection.UpdateMany(ctx, filter, update)
		if err != nil {
			return fmt.Errorf("failed to copy team to workspace in %s collection: %w", collectionName, err)
		}

		log.Printf("CopyTeamToWorkspace migration completed for %s collection: updated %d documents", collectionName, result.ModifiedCount)
	}

	return nil
}
