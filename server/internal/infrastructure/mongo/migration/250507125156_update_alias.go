package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UpdateAlias(ctx context.Context, c DBClient) error {

	if err := updateEmptyAliases(ctx, c, "project", "c-"); err != nil {
		return err
	}

	if err := updateEmptyAliases(ctx, c, "storytelling", "s-"); err != nil {
		return err
	}

	return nil
}

func updateEmptyAliases(ctx context.Context, c DBClient, collectionName, prefix string) error {
	collection := c.WithCollection(collectionName).Client()

	filter := bson.M{
		"$or": []bson.M{
			{"alias": bson.M{"$exists": false}},
			{"alias": ""},
			{"alias": nil},
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find documents in %s: %w", collectionName, err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("failed to close cursor for %s: %v", collectionName, err)
		}
	}()

	var count int64
	for cursor.Next(ctx) {
		var doc struct {
			ID string `bson:"id"`
		}
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("failed to decode document in %s: %v", collectionName, err)
			continue
		}

		var alias string

		if collectionName == "project" {
			sceneID, err := getSceneIDByProjectID(ctx, c, doc.ID)
			if err != nil {
				log.Printf("failed to get scene ID for project %s: %v", doc.ID, err)
				continue
			}
			alias = fmt.Sprintf("c-%s", sceneID)
		} else {
			var idDoc struct {
				ObjectID primitive.ObjectID `bson:"_id"`
			}
			if err := cursor.Decode(&idDoc); err != nil {
				log.Printf("failed to decode _id for %s: %v", collectionName, err)
				continue
			}
			alias = fmt.Sprintf("%s%s", prefix, idDoc.ObjectID.Hex())
		}

		_, err := collection.UpdateOne(ctx,
			bson.M{"id": doc.ID},
			bson.M{"$set": bson.M{"alias": alias}},
		)
		if err != nil {
			log.Printf("failed to update alias for %s %s: %v", collectionName, doc.ID, err)
			continue
		}
		count++
	}

	log.Printf("Updated alias for %d documents in %s\n", count, collectionName)
	return nil
}

func getSceneIDByProjectID(ctx context.Context, c DBClient, projectID string) (string, error) {
	sceneColl := c.WithCollection("scene").Client()
	var sceneDoc struct {
		ID string `bson:"id"`
	}
	if err := sceneColl.FindOne(ctx, bson.M{"project": projectID}).Decode(&sceneDoc); err != nil {
		return "", fmt.Errorf("scene not found for project %s: %w", projectID, err)
	}
	return sceneDoc.ID, nil
}
