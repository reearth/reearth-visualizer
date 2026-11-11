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

func listIndexKeys(t *testing.T, ctx context.Context, col *mongo.Collection) map[string]bson.D {
	t.Helper()
	cursor, err := col.Indexes().List(ctx)
	require.NoError(t, err)
	defer cursor.Close(ctx)

	res := map[string]bson.D{}
	for cursor.Next(ctx) {
		var spec struct {
			Name string `bson:"name"`
			Key  bson.D `bson:"key"`
		}
		require.NoError(t, cursor.Decode(&spec))
		res[spec.Name] = spec.Key
	}
	require.NoError(t, cursor.Err())
	return res
}

func createTestIndex(t *testing.T, ctx context.Context, col *mongo.Collection, name string, keys bson.D) {
	t.Helper()
	_, err := col.Indexes().CreateOne(ctx, mongo.IndexModel{Keys: keys, Options: options.Index().SetName(name)})
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

func TestSyncProjectAndPropertyIndexes(t *testing.T) {
	ctx := context.Background()

	t.Run("creates project indexes and drops redundant indexes", func(t *testing.T) {
		db := mongotest.Connect(t)(t)
		client := mongox.NewClientWithDatabase(db)
		project := db.Collection("project")
		property := db.Collection("property")

		createTestIndex(t, ctx, project, "alias_1", bson.D{{Key: "alias", Value: 1}})
		createTestIndex(t, ctx, project, "alias_1_publishmentstatus_1", bson.D{{Key: "alias", Value: 1}, {Key: "publishmentstatus", Value: 1}})
		for _, key := range redundantPropertyIndexKeys {
			createTestIndex(t, ctx, property, key+"_1", bson.D{{Key: key, Value: 1}})
			createTestIndex(t, ctx, property, coveringIndexName(key), coveringIndexKeys(key))
		}

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))

		projectIndexes := listIndexKeys(t, ctx, project)
		assert.Contains(t, projectIndexes, "project_coresupport_workspace_updatedat_id")
		assert.Contains(t, projectIndexes, "project_coresupport_deleted_workspace_updatedat_id")
		assert.Contains(t, projectIndexes, "alias_1_publishmentstatus_1")
		assert.NotContains(t, projectIndexes, "alias_1")

		propertyIndexes := listIndexKeys(t, ctx, property)
		for _, key := range redundantPropertyIndexKeys {
			assert.NotContains(t, propertyIndexes, key+"_1")
			assert.Contains(t, propertyIndexes, coveringIndexName(key))
		}

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))
		assert.Equal(t, projectIndexes, listIndexKeys(t, ctx, project))
		assert.Equal(t, propertyIndexes, listIndexKeys(t, ctx, property))
	})

	t.Run("skips project indexes that already exist under another name", func(t *testing.T) {
		db := mongotest.Connect(t)(t)
		client := mongox.NewClientWithDatabase(db)
		project := db.Collection("project")

		createTestIndex(t, ctx, project, "coresupport_1_workspace_1_updatedat_-1_id_-1", bson.D{
			{Key: "coresupport", Value: 1}, {Key: "workspace", Value: 1}, {Key: "updatedat", Value: -1}, {Key: "id", Value: -1},
		})
		createTestIndex(t, ctx, project, "coresupport_1_deleted_1_workspace_1_updatedat_-1_id_-1", bson.D{
			{Key: "coresupport", Value: 1}, {Key: "deleted", Value: 1}, {Key: "workspace", Value: 1}, {Key: "updatedat", Value: -1}, {Key: "id", Value: -1},
		})

		require.NoError(t, SyncProjectAndPropertyIndexes(ctx, client))

		projectIndexes := listIndexKeys(t, ctx, project)
		assert.Contains(t, projectIndexes, "coresupport_1_workspace_1_updatedat_-1_id_-1")
		assert.Contains(t, projectIndexes, "coresupport_1_deleted_1_workspace_1_updatedat_-1_id_-1")
		assert.NotContains(t, projectIndexes, "project_coresupport_workspace_updatedat_id")
		assert.NotContains(t, projectIndexes, "project_coresupport_deleted_workspace_updatedat_id")
	})
}
