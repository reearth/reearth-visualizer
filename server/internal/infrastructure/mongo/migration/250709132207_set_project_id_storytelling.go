package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetProjectIdStorytelling(ctx context.Context, c DBClient) error {
	storytellingCollection := c.WithCollection("storytelling").Client()
	sceneCollection := c.WithCollection("scene").Client()

	cursor, err := storytellingCollection.Find(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to find documents in storytelling: %w", err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("failed to close cursor for storytelling: %v", err)
		}
	}()

	for cursor.Next(ctx) {
		var storytelling struct {
			ID    string `bson:"_id"`
			Scene string `bson:"scene"`
		}

		if err := cursor.Decode(&storytelling); err != nil {
			log.Printf("failed to decode storytelling document: %v", err)
			continue
		}

		var scene struct {
			Project string `bson:"project"`
		}

		err := sceneCollection.FindOne(ctx, bson.M{"id": storytelling.Scene}).Decode(&scene)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				log.Printf("scene not found for storytelling ID %s, scene ID %s", storytelling.ID, storytelling.Scene)
				continue
			}
			log.Printf("failed to find scene for storytelling ID %s: %v", storytelling.ID, err)
			continue
		}

		update := bson.M{
			"$set": bson.M{
				"project": scene.Project,
			},
		}

		_, err = storytellingCollection.UpdateOne(
			ctx,
			bson.M{"_id": storytelling.ID},
			update,
		)
		if err != nil {
			log.Printf("failed to update storytelling ID %s: %v", storytelling.ID, err)
			continue
		}

		log.Printf("successfully updated storytelling ID %s with project ID %s", storytelling.ID, scene.Project)
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	return nil
}
