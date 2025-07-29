package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func CopyWorkspaceToTeam(ctx context.Context, c DBClient) error {
	// Define collections that need workspace to team copy
	collections := []string{"project", "scene", "asset"}

	for _, collectionName := range collections {
		collection := c.WithCollection(collectionName).Client()

		// Find documents that have workspace field but no team field
		filter := bson.M{
			"workspace": bson.M{"$exists": true},
			"team":      bson.M{"$exists": false},
		}

		// Copy workspace value to team field
		update := []bson.M{
			{
				"$set": bson.M{
					"team": "$workspace",
				},
			},
		}

		result, err := collection.UpdateMany(ctx, filter, update)
		if err != nil {
			return fmt.Errorf("failed to copy workspace to team in %s collection: %w", collectionName, err)
		}

		log.Printf("CopyWorkspaceToTeam migration completed for %s collection: updated %d documents", collectionName, result.ModifiedCount)
	}

	return nil
}
