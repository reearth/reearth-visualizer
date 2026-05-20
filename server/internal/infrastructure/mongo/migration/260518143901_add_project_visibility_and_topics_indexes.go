package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
// The migration is idempotent: if an index with the same key spec already
// exists (regardless of its name), creation is skipped. Other errors are
// propagated so the migration framework can mark this migration as
// unapplied and retry on a future run instead of silently leaving the
// database without the intended indexes.
func AddProjectVisibilityAndTopicsIndexes(ctx context.Context, c DBClient) error {
	if err := createNonUniqueIndex(ctx, c, "project", "project_visibility_deleted", bson.D{
		{Key: "visibility", Value: 1},
		{Key: "deleted", Value: 1},
	}); err != nil {
		return err
	}
	if err := createNonUniqueIndex(ctx, c, "projectmetadata", "projectmetadata_topics", bson.D{
		{Key: "topics", Value: 1},
	}); err != nil {
		return err
	}
	return nil
}

func createNonUniqueIndex(ctx context.Context, c DBClient, collectionName, indexName string, keys bson.D) error {
	collection := c.Database().Collection(collectionName)

	exists, existingName, err := indexWithKeysExists(ctx, collection, keys)
	if err != nil {
		return fmt.Errorf("migration: AddProjectVisibilityAndTopicsIndexes: failed to list indexes on %s: %w", collectionName, err)
	}
	if exists {
		log.Infofc(ctx, "migration: AddProjectVisibilityAndTopicsIndexes: index already exists on %s as %q, skipping", collectionName, existingName)
		return nil
	}

	name, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    keys,
		Options: options.Index().SetName(indexName),
	})
	if err != nil {
		return fmt.Errorf("migration: AddProjectVisibilityAndTopicsIndexes: failed to create index on %s: %w", collectionName, err)
	}
	log.Infofc(ctx, "migration: AddProjectVisibilityAndTopicsIndexes: created index on %s: %s", collectionName, name)
	return nil
}

// indexWithKeysExists returns the name of any existing index on col whose
// key specification matches keys (same field names in the same order with the
// same direction values). MongoDB enforces that only one index can exist per
// key spec, so a positive match here means CreateOne would either succeed as
// a no-op or fail with a conflict; we skip in either case.
//
// Note: the match is strict on field order. A pre-existing index that
// reverses the order — for example {deleted: 1, visibility: 1} when this
// migration wants {visibility: 1, deleted: 1} — is treated as a different
// index and the migration will still create its declared index. This is
// intentional: MongoDB compound indexes are order-sensitive (prefix-match
// rules differ), so silently treating reversed orders as equivalent could
// leave the workload on a less-effective index. Operators pre-building
// these indexes manually must use the field order declared in
// AddProjectVisibilityAndTopicsIndexes.
func indexWithKeysExists(ctx context.Context, col *mongo.Collection, keys bson.D) (bool, string, error) {
	cursor, err := col.Indexes().List(ctx)
	if err != nil {
		return false, "", err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var spec struct {
			Name string `bson:"name"`
			Key  bson.D `bson:"key"`
		}
		if err := cursor.Decode(&spec); err != nil {
			return false, "", err
		}
		if keysEqual(spec.Key, keys) {
			return true, spec.Name, nil
		}
	}
	return false, "", cursor.Err()
}

func keysEqual(a, b bson.D) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i].Key != b[i].Key {
			return false
		}
		// Index direction is stored as int32 on disk but may decode as int32 or int64;
		// compare numerically when both sides are integers.
		ai, aok := toInt64(a[i].Value)
		bi, bok := toInt64(b[i].Value)
		if !aok || !bok || ai != bi {
			return false
		}
	}
	return true
}

func toInt64(v any) (int64, bool) {
	switch x := v.(type) {
	case int:
		return int64(x), true
	case int32:
		return int64(x), true
	case int64:
		return x, true
	}
	return 0, false
}
