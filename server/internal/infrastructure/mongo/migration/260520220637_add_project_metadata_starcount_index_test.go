package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

// TestAddProjectMetadataStarcountIndex_Backfill verifies that the migration
// coerces any non-numeric starcount to 0, lifting a usable legacy
// star_count value when present, and leaves already-numeric starcount
// values untouched. It also confirms that the (starcount, project) index
// is created after the backfill.
func TestAddProjectMetadataStarcountIndex_Backfill(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("projectmetadata").Client()

	// Seed the collection with a mix of states that the backfill should
	// normalize, plus one document with a valid starcount to ensure
	// untouched documents stay untouched.
	docs := []interface{}{
		bson.M{"project": "missing"},                                             // starcount field absent
		bson.M{"project": "null", "starcount": nil},                              // starcount: null
		bson.M{"project": "string", "starcount": "not-a-number"},                 // starcount: wrong type
		bson.M{"project": "legacy", "star_count": int64(7)},                      // only legacy field
		bson.M{"project": "legacy_with_null", "starcount": nil, "star_count": 3}, // null starcount, legacy present
		bson.M{"project": "legacy_string", "star_count": "still-not-a-number"},   // legacy field is not numeric
		bson.M{"project": "untouched", "starcount": int64(42)},                   // already valid, must stay
	}
	_, err := col.InsertMany(ctx, docs)
	require.NoError(t, err)

	require.NoError(t, AddProjectMetadataStarcountIndex(ctx, client))

	type row struct {
		Project   string `bson:"project"`
		Starcount int64  `bson:"starcount"`
	}
	cur, err := col.Find(ctx, bson.M{})
	require.NoError(t, err)
	defer cur.Close(ctx)

	got := map[string]int64{}
	for cur.Next(ctx) {
		var r row
		require.NoError(t, cur.Decode(&r))
		got[r.Project] = r.Starcount
	}
	require.NoError(t, cur.Err())

	assert.Equal(t, int64(0), got["missing"], "missing starcount should backfill to 0")
	assert.Equal(t, int64(0), got["null"], "null starcount should backfill to 0")
	assert.Equal(t, int64(0), got["string"], "non-numeric starcount should backfill to 0")
	assert.Equal(t, int64(7), got["legacy"], "missing starcount should inherit numeric star_count")
	assert.Equal(t, int64(3), got["legacy_with_null"], "null starcount should inherit numeric star_count")
	assert.Equal(t, int64(0), got["legacy_string"], "non-numeric star_count should not pollute starcount")
	assert.Equal(t, int64(42), got["untouched"], "already-numeric starcount must not be overwritten")

	// Verify the (starcount, project) index was created.
	idxCur, err := col.Indexes().List(ctx)
	require.NoError(t, err)
	defer idxCur.Close(ctx)

	var foundIndex bool
	for idxCur.Next(ctx) {
		var spec struct {
			Name string `bson:"name"`
			Key  bson.D `bson:"key"`
		}
		require.NoError(t, idxCur.Decode(&spec))
		if keysEqual(spec.Key, bson.D{{Key: "starcount", Value: 1}, {Key: "project", Value: 1}}) {
			foundIndex = true
			assert.Equal(t, "projectmetadata_starcount_project", spec.Name, "expected stable index name")
		}
	}
	require.NoError(t, idxCur.Err())
	assert.True(t, foundIndex, "expected (starcount, project) index after migration")
}

// TestAddProjectMetadataStarcountIndex_Idempotent ensures that re-running
// the migration on already-normalized data is a no-op and does not error.
func TestAddProjectMetadataStarcountIndex_Idempotent(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("projectmetadata").Client()

	_, err := col.InsertOne(ctx, bson.M{"project": "p1", "starcount": int64(5)})
	require.NoError(t, err)

	require.NoError(t, AddProjectMetadataStarcountIndex(ctx, client))
	require.NoError(t, AddProjectMetadataStarcountIndex(ctx, client))

	var doc struct {
		Starcount int64 `bson:"starcount"`
	}
	require.NoError(t, col.FindOne(ctx, bson.M{"project": "p1"}).Decode(&doc))
	assert.Equal(t, int64(5), doc.Starcount, "starcount must remain unchanged across re-runs")
}
