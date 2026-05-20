package migration

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
)

// AddProjectmetadataStarcountIndex creates a compound (starcount, _id) index
// on the projectmetadata collection to back the most_starred sort path used
// by InternalAPI GetAllProjects. The aggregation starts from projectmetadata
// sorted by starcount (with _id as the deterministic tie-break) and only
// then joins to project, so an index-backed sort on (starcount, _id)
// replaces the previous in-memory sort over every public project. The plan
// is not index-only (the project field still has to be read from each
// document for the $lookup), but the sort no longer needs to buffer the
// full result set.
//
// The same ascending compound index serves both DESC and ASC queries
// because MongoDB scans the index in the reverse direction when the sort
// inverts every key uniformly.
//
// Idempotent: skipped when an equivalent (same key spec) index already
// exists, regardless of name. Errors are propagated.
func AddProjectmetadataStarcountIndex(ctx context.Context, c DBClient) error {
	return createNonUniqueIndex(ctx, c, "projectmetadata", "projectmetadata_starcount_id", bson.D{
		{Key: "starcount", Value: 1},
		{Key: "_id", Value: 1},
	}, nil)
}
