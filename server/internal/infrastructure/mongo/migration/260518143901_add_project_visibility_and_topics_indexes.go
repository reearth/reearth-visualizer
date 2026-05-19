package migration

import (
	"context"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// AddProjectVisibilityAndTopicsIndexes creates indexes that back the public
// project listing path used by InternalAPI GetAllProjects.
//
//   - project: (visibility, deleted) — the default FindAll filter selects
//     by visibility and the not-deleted flag, so the composite index turns
//     a collection scan into an index range scan.
//   - projectmetadata: topics — topics filtering pre-queries projectmetadata
//     for matching project IDs before fanning out to project, and the topics
//     array needs an index for the $all match to be selective.
//
// Index creation is idempotent; if the index already exists CreateOne returns
// without error.
func AddProjectVisibilityAndTopicsIndexes(ctx context.Context, c DBClient) error {
	createNonUniqueIndex(ctx, c, "project", bson.D{
		{Key: "visibility", Value: 1},
		{Key: "deleted", Value: 1},
	})
	createNonUniqueIndex(ctx, c, "projectmetadata", bson.D{
		{Key: "topics", Value: 1},
	})
	return nil
}

func createNonUniqueIndex(ctx context.Context, c DBClient, collectionName string, keys bson.D) {
	collection := c.Database().Collection(collectionName)
	name, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: keys,
	})
	if err != nil {
		log.Warnfc(ctx, "migration: AddProjectVisibilityAndTopicsIndexes: failed to create index on %s: %v", collectionName, err)
		return
	}
	log.Infofc(ctx, "migration: AddProjectVisibilityAndTopicsIndexes: created index on %s: %s", collectionName, name)
}
