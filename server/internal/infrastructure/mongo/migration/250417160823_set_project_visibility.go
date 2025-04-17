package migration

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func SetProjectVisibility(ctx context.Context, c DBClient) error {

	filter := bson.M{}

	update := bson.M{
		"$set": bson.M{
			"visibility": "private",
		},
	}

	result, err := c.WithCollection("project").Client().UpdateMany(ctx, filter, update)
	if err != nil {
		log.Fatalf("Update error: %v", err)
	}

	log.Printf("Matched %d documents and updated %d documents.\n", result.MatchedCount, result.ModifiedCount)

	return err
}
