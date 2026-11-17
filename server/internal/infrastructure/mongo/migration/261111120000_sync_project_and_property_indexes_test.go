package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type testIndexSpec struct {
	Key       bson.D
	Collation bson.M
}

func listIndexSpecs(t *testing.T, ctx context.Context, col *mongo.Collection) map[string]testIndexSpec {
	t.Helper()
	cursor, err := col.Indexes().List(ctx)
	require.NoError(t, err)
	defer cursor.Close(ctx)

	res := map[string]testIndexSpec{}
	for cursor.Next(ctx) {
		var spec struct {
			Name      string `bson:"name"`
			Key       bson.D `bson:"key"`
			Collation bson.M `bson:"collation,omitempty"`
		}
		require.NoError(t, cursor.Decode(&spec))
		res[spec.Name] = testIndexSpec{Key: spec.Key, Collation: spec.Collation}
	}
	require.NoError(t, cursor.Err())
	return res
}

func createTestIndex(t *testing.T, ctx context.Context, col *mongo.Collection, name string, keys bson.D, collation *options.Collation) {
	t.Helper()
	opts := options.Index().SetName(name)
	if collation != nil {
		opts = opts.SetCollation(collation)
	}
	_, err := col.Indexes().CreateOne(ctx, mongo.IndexModel{Keys: keys, Options: opts})
	require.NoError(t, err)
}

func coveringIndexKeys(key string) bson.D {
	if key == "scene" {
		return bson.D{{Key: "scene", Value: 1}, {Key: "schemaplugin", Value: 1}}
	}
	return bson.D{{Key: key, Value: 1}, {Key: "scene", Value: 1}}
}

func coveringIndexName(key string) string {
	if key == "scene" {
		return "scene_1_schemaplugin_1"
	}
	return key + "_1_scene_1"
}

func seedRedundantIndexes(t *testing.T, ctx context.Context, db *mongo.Database) {
	t.Helper()
	project := db.Collection("project")
	property := db.Collection("property")
	createTestIndex(t, ctx, project, "alias_1", bson.D{{Key: "alias", Value: 1}}, nil)
	createTestIndex(t, ctx, project, "alias_1_publishmentstatus_1", bson.D{{Key: "alias", Value: 1}, {Key: "publishmentstatus", Value: 1}}, nil)
	for _, key := range redundantPropertyIndexKeys {
		createTestIndex(t, ctx, property, key+"_1", bson.D{{Key: key, Value: 1}}, nil)
		createTestIndex(t, ctx, property, coveringIndexName(key), coveringIndexKeys(key), nil)
	}
}

func TestSyncProjectAndPropertyIndexes(t *testing.T) {
	ctx := context.Background()

	t.Run("creates indexes and drops redundant indexes", func(t *testing.T) {
		db := mongotest.Connect(t)(t)
		client := mongox.NewClientWithDatabase(db)
		seedRedundantIndexes(t, ctx, db)

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))

		for _, idx := range syncCreatedIndexes {
			specs := listIndexSpecs(t, ctx, db.Collection(idx.collection))
			require.Contains(t, specs, idx.name)
			assert.True(t, keysEqual(specs[idx.name].Key, idx.keys), idx.name)
			assert.True(t, collationsEqual(specs[idx.name].Collation, idx.collation), idx.name)
		}

		projectIndexes := listIndexSpecs(t, ctx, db.Collection("project"))
		assert.Contains(t, projectIndexes, "alias_1_publishmentstatus_1")
		assert.NotContains(t, projectIndexes, "alias_1")

		propertyIndexes := listIndexSpecs(t, ctx, db.Collection("property"))
		for _, key := range redundantPropertyIndexKeys {
			assert.NotContains(t, propertyIndexes, key+"_1")
			assert.Contains(t, propertyIndexes, coveringIndexName(key))
		}

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))
		assert.Equal(t, projectIndexes, listIndexSpecs(t, ctx, db.Collection("project")))
		assert.Equal(t, propertyIndexes, listIndexSpecs(t, ctx, db.Collection("property")))
	})

	t.Run("skips an index that exists with the same keys and collation", func(t *testing.T) {
		db := mongotest.Connect(t)(t)
		client := mongox.NewClientWithDatabase(db)
		project := db.Collection("project")
		existing := syncCreatedIndexes[0]
		createTestIndex(t, ctx, project, "handmade", existing.keys, existing.collation)

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))

		specs := listIndexSpecs(t, ctx, project)
		assert.Contains(t, specs, "handmade")
		assert.NotContains(t, specs, existing.name)
	})

	t.Run("creates the collated index when only a non-collated one with the same keys exists", func(t *testing.T) {
		db := mongotest.Connect(t)(t)
		client := mongox.NewClientWithDatabase(db)
		project := db.Collection("project")
		existing := syncCreatedIndexes[0]
		createTestIndex(t, ctx, project, "coresupport_1_workspace_1_updatedat_-1_id_-1", existing.keys, nil)

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))

		specs := listIndexSpecs(t, ctx, project)
		assert.Contains(t, specs, "coresupport_1_workspace_1_updatedat_-1_id_-1")
		require.Contains(t, specs, existing.name)
		assert.True(t, collationsEqual(specs[existing.name].Collation, projectQueryCollation))
	})
}

func TestRevertSyncProjectAndPropertyIndexes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	seedRedundantIndexes(t, ctx, db)
	createTestIndex(t, ctx, db.Collection("project"), "coresupport_1_workspace_1_updatedat_-1_id_-1", syncCreatedIndexes[0].keys, nil)
	require.NoError(t, db.CreateCollection(ctx, "asset"))

	before := map[string]map[string]testIndexSpec{}
	for _, c := range []string{"project", "property", "asset"} {
		before[c] = listIndexSpecs(t, ctx, db.Collection(c))
	}

	require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))
	require.NoError(t, RevertSyncProjectAndPropertyIndexes(ctx, client))

	for _, c := range []string{"project", "property", "asset"} {
		assert.Equal(t, before[c], listIndexSpecs(t, ctx, db.Collection(c)), c)
	}

	require.NoError(t, RevertSyncProjectAndPropertyIndexes(ctx, client))
	for _, c := range []string{"project", "property", "asset"} {
		assert.Equal(t, before[c], listIndexSpecs(t, ctx, db.Collection(c)), c)
	}
}
