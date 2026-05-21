package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
)

// AddProjectMetadataStarcountIndex backfills projectmetadata.starcount and
// creates a compound (starcount, project) index that backs the most_starred
// sort path used by InternalAPI GetAllProjects.
//
// Backfill: the original AddProjectMetadata migration did not set
// starcount on existing documents, and older fixup migrations wrote a
// sibling star_count (with underscore) field that the application does
// not read. Without the backfill, MongoDB would sort missing/null
// starcount as null, placing those documents at the boundaries of the
// result and diverging from the previous in-memory $ifNull→0 semantics.
// We coerce any non-numeric starcount to 0, pulling from the legacy
// star_count field when it carries a usable number.
//
// Index: the aggregation reads metadata in starcount order and joins to
// project, so an index-backed sort on (starcount, project) replaces the
// previous in-memory sort over every public project. The plan is not
// index-only (project still has to be read for the $lookup), but the
// sort no longer needs to buffer the full result set. The same
// ascending compound index serves both DESC and ASC queries because
// MongoDB scans the index in the reverse direction when the sort
// inverts every key uniformly.
//
// Tie-break: projectmetadata.project (the project ID) is used instead of
// the metadata document's _id because metadata _id values are not
// stable across the legacy backfill path. AddProjectMetadata generated
// fresh metadata _ids for all pre-existing projects in one pass, so
// their _id ordering reflects backfill order rather than project
// creation order. The project ID is a stable per-project identifier
// that gives deterministic pagination across deployments.
//
// Idempotent: the backfill targets only documents without a numeric
// starcount, and createNonUniqueIndex is itself idempotent.
func AddProjectMetadataStarcountIndex(ctx context.Context, c DBClient) error {
	if err := backfillStarcount(ctx, c); err != nil {
		return err
	}
	return createNonUniqueIndex(ctx, c, "projectmetadata", "projectmetadata_starcount_project", bson.D{
		{Key: "starcount", Value: 1},
		{Key: "project", Value: 1},
	}, nil)
}

func backfillStarcount(ctx context.Context, c DBClient) error {
	col := c.Database().Collection("projectmetadata")
	// $set with a pipeline lets us read the legacy star_count value from
	// the same document when computing the new starcount.
	filter := bson.M{"starcount": bson.M{"$not": bson.M{"$type": "number"}}}
	update := bson.A{
		bson.M{"$set": bson.M{
			"starcount": bson.M{
				"$cond": bson.M{
					"if":   bson.M{"$isNumber": "$star_count"},
					"then": "$star_count",
					"else": int64(0),
				},
			},
		}},
	}
	res, err := col.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("migration: AddProjectMetadataStarcountIndex: failed to backfill starcount: %w", err)
	}
	if res.ModifiedCount > 0 {
		log.Infofc(ctx, "migration: AddProjectMetadataStarcountIndex: backfilled starcount on %d projectmetadata documents", res.ModifiedCount)
	}
	return nil
}
