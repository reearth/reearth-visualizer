package migration

import (
	"context"
	"fmt"

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
//   - projectmetadata: topics — topics filtering runs a pipeline-form
//     $lookup whose sub-pipeline matches metadata by the topics array, so
//     the topics field needs an index for the $all match to be selective.
//
// Index creation is idempotent; CreateOne against an equivalent existing
// index is a no-op. Other errors are propagated so the migration framework
// can mark this migration as unapplied and retry on a future run instead of
// silently leaving the database without the intended indexes.
func AddProjectVisibilityAndTopicsIndexes(ctx context.Context, c DBClient) error {
	if err := createNonUniqueIndex(ctx, c, "project", bson.D{
		{Key: "visibility", Value: 1},
		{Key: "deleted", Value: 1},
	}); err != nil {
		return err
	}
	if err := createNonUniqueIndex(ctx, c, "projectmetadata", bson.D{
		{Key: "topics", Value: 1},
	}); err != nil {
		return err
	}
	return nil
}

func createNonUniqueIndex(ctx context.Context, c DBClient, collectionName string, keys bson.D) error {
	collection := c.Database().Collection(collectionName)
	name, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: keys,
	})
	if err != nil {
		return fmt.Errorf("migration: AddProjectVisibilityAndTopicsIndexes: failed to create index on %s: %w", collectionName, err)
	}
	log.Infofc(ctx, "migration: AddProjectVisibilityAndTopicsIndexes: created index on %s: %s", collectionName, name)
	return nil
}
