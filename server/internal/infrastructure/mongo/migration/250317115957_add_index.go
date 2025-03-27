package migration

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func AddIndex(ctx context.Context, c DBClient) error {

	createIndex(ctx, c, "project", bson.D{{Key: "id", Value: 1}})

	createIndex(ctx, c, "scene", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "scene", bson.D{{Key: "project", Value: 1}})

	createIndex(ctx, c, "asset", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "asset", bson.D{{Key: "project", Value: 1}})
	createIndex(ctx, c, "asset", bson.D{{Key: "url", Value: 1}})

	createIndex(ctx, c, "nlsLayer", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "nlsLayer", bson.D{{Key: "scene", Value: 1}})

	createIndex(ctx, c, "storytelling", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "storytelling", bson.D{{Key: "scene", Value: 1}})

	createIndex(ctx, c, "style", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "style", bson.D{{Key: "scene", Value: 1}})

	createIndex(ctx, c, "property", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "property", bson.D{{Key: "scene", Value: 1}})

	createIndex(ctx, c, "plugin", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "plugin", bson.D{{Key: "scene", Value: 1}})

	createIndex(ctx, c, "propertySchema", bson.D{{Key: "id", Value: 1}})
	createIndex(ctx, c, "propertySchema", bson.D{{Key: "scene", Value: 1}})

	return nil
}

func createIndex(ctx context.Context, c DBClient, collectionName string, keys bson.D) {
	collection := c.Database().Collection(collectionName)
	indexModel := mongo.IndexModel{
		Keys:    keys,
		Options: options.Index().SetUnique(true),
	}

	name, err := collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		// If there is already an index with the same content, it will fail.
		log.Printf("failed to create index for %s: %v", collectionName, err)
	} else {
		log.Printf("Index created successfully for %s: %v", collectionName, name)
	}
}
