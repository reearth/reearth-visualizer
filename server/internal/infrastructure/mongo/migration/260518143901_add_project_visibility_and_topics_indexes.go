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
// projectQueryCollation mirrors the collation used by Project.FindAll's
// non-aggregation Find path. MongoDB only picks an index for a collationed
// query when the index's collation matches the query's, so the
// (visibility, deleted) project index must be created with the same
// collation to be usable from that path. The topics index lives on
// projectmetadata, which the aggregation pipeline reads without collation,
// so it stays on the default collation.
var projectQueryCollation = &options.Collation{
	Locale:    "en",
	Strength:  3,
	CaseLevel: true,
	Alternate: "shifted",
}

const addProjectVisibilityAndTopicsIndexesName = "AddProjectVisibilityAndTopicsIndexes"

func AddProjectVisibilityAndTopicsIndexes(ctx context.Context, c DBClient) error {
	if err := createNonUniqueIndex(ctx, c, addProjectVisibilityAndTopicsIndexesName, "project", "project_visibility_deleted", bson.D{
		{Key: "visibility", Value: 1},
		{Key: "deleted", Value: 1},
	}, projectQueryCollation); err != nil {
		return err
	}
	if err := createNonUniqueIndex(ctx, c, addProjectVisibilityAndTopicsIndexesName, "projectmetadata", "projectmetadata_topics", bson.D{
		{Key: "topics", Value: 1},
	}, nil); err != nil {
		return err
	}
	return nil
}

// createNonUniqueIndex is shared between index-adding migrations. The
// migrationName parameter is used as a prefix in log lines and wrapped
// errors so that deploy-time failures clearly identify which migration
// they originated from.
func createNonUniqueIndex(ctx context.Context, c DBClient, migrationName, collectionName, indexName string, keys bson.D, collation *options.Collation) error {
	collection := c.Database().Collection(collectionName)

	exists, existingName, err := indexWithKeysExists(ctx, collection, keys, collation)
	if err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, collectionName, err)
	}
	if exists {
		log.Infofc(ctx, "migration: %s: index already exists on %s as %q, skipping", migrationName, collectionName, existingName)
		return nil
	}

	idxOpts := options.Index().SetName(indexName)
	if collation != nil {
		idxOpts = idxOpts.SetCollation(collation)
	}
	name, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    keys,
		Options: idxOpts,
	})
	if err != nil {
		return fmt.Errorf("migration: %s: failed to create index on %s: %w", migrationName, collectionName, err)
	}
	log.Infofc(ctx, "migration: %s: created index on %s: %s", migrationName, collectionName, name)
	return nil
}

// indexWithKeysExists returns the name of any existing index on col whose
// key specification matches keys (same field names in the same order with the
// same direction values) AND whose collation matches the requested one.
// MongoDB allows two indexes with the same key spec to coexist as long as
// they have different collations (because the query planner picks them
// based on the query's collation), so we treat collation as part of
// identity here.
//
// Note: the key match is strict on field order. A pre-existing index that
// reverses the order — for example {deleted: 1, visibility: 1} when this
// migration wants {visibility: 1, deleted: 1} — is treated as a different
// index and the migration will still create its declared index. This is
// intentional: MongoDB compound indexes are order-sensitive (prefix-match
// rules differ), so silently treating reversed orders as equivalent could
// leave the workload on a less-effective index. Operators pre-building
// these indexes manually must use the field order declared in
// AddProjectVisibilityAndTopicsIndexes.
func indexWithKeysExists(ctx context.Context, col *mongo.Collection, keys bson.D, collation *options.Collation) (bool, string, error) {
	cursor, err := col.Indexes().List(ctx)
	if err != nil {
		return false, "", err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var spec struct {
			Name      string `bson:"name"`
			Key       bson.D `bson:"key"`
			Collation bson.M `bson:"collation,omitempty"`
		}
		if err := cursor.Decode(&spec); err != nil {
			return false, "", err
		}
		if keysEqual(spec.Key, keys) && collationsEqual(spec.Collation, collation) {
			return true, spec.Name, nil
		}
	}
	return false, "", cursor.Err()
}

// collationsEqual reports whether a stored index collation (as decoded from
// MongoDB's indexes listing) matches a requested options.Collation. Both
// nil/missing means "default collation"; otherwise we compare the fields we
// set on the requested side, which is enough for the small set of options
// this migration uses.
func collationsEqual(stored bson.M, requested *options.Collation) bool {
	if requested == nil {
		return len(stored) == 0
	}
	if len(stored) == 0 {
		return false
	}
	if s, _ := stored["locale"].(string); s != requested.Locale {
		return false
	}
	if requested.Strength != 0 {
		si, ok := toInt64(stored["strength"])
		if !ok || si != int64(requested.Strength) {
			return false
		}
	}
	if requested.CaseLevel {
		cl, _ := stored["caseLevel"].(bool)
		if !cl {
			return false
		}
	}
	if requested.Alternate != "" {
		alt, _ := stored["alternate"].(string)
		if alt != requested.Alternate {
			return false
		}
	}
	return true
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
