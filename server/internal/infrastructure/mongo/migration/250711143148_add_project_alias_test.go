package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// go test -v -run TestAddProjectAlias ./internal/infrastructure/mongo/migration/...

func TestAddProjectAlias(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()

	objectID1 := primitive.NewObjectID()
	objectID2 := primitive.NewObjectID()

	testDocs := []interface{}{
		bson.M{
			"_id":  objectID1,
			"id":   "01jzvnj5tfkjrr227tahf2fvyb",
			"team": "01jzqb3qsgr17g8gc5x3qrb114",
			"name": "test1",
		},
		bson.M{
			"_id":  objectID2,
			"id":   "01jzvnj5tfkjrr227tahf2fvyc",
			"team": "01jzqb3qsgr17g8gc5x3qrb115",
			"name": "test2",
		},
	}

	_, err := projectCollection.InsertMany(ctx, testDocs)
	require.NoError(t, err)

	t.Run("before migration", func(t *testing.T) {
		var doc bson.M
		err := projectCollection.FindOne(ctx, bson.M{"_id": objectID1}).Decode(&doc)
		require.NoError(t, err)

		_, exists := doc["projectalias"]
		assert.False(t, exists, "projectalias should not exist before migration")
	})

	t.Run("execute migration", func(t *testing.T) {
		err := AddProjectAlias(ctx, client)
		require.NoError(t, err)
	})

	t.Run("after migration", func(t *testing.T) {

		var doc1 bson.M
		err := projectCollection.FindOne(ctx, bson.M{"_id": objectID1}).Decode(&doc1)
		require.NoError(t, err)

		projectalias1, exists := doc1["projectalias"]
		assert.True(t, exists, "projectalias should exist after migration")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvyb", projectalias1, "projectalias should be correct")

		var doc2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID2}).Decode(&doc2)
		require.NoError(t, err)

		projectalias2, exists := doc2["projectalias"]
		assert.True(t, exists, "projectalias should exist after migration")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvyc", projectalias2, "projectalias should be correct")
	})

	t.Run("duplicate migration", func(t *testing.T) {
		err := AddProjectAlias(ctx, client)
		require.NoError(t, err)
		var doc bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID1}).Decode(&doc)
		require.NoError(t, err)

		projectalias, exists := doc["projectalias"]
		assert.True(t, exists, "projectalias should still exist")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvyb", projectalias, "projectalias should remain unchanged")
	})

	t.Run("verify all documents", func(t *testing.T) {
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		count := 0
		for cursor.Next(ctx) {
			var doc bson.M
			err := cursor.Decode(&doc)
			require.NoError(t, err)
			projectalias, exists := doc["projectalias"]
			assert.True(t, exists, "all documents should have projectalias")
			assert.Contains(t, projectalias.(string), "p-", "projectalias should start with 'p-'")

			count++
		}

		assert.Equal(t, 2, count, "should process all documents")
	})

	t.Run("document without id field", func(t *testing.T) {
		invalidDoc := bson.M{
			"_id":  primitive.NewObjectID(),
			"team": "01jzqb3qsgr17g8gc5x3qrb116",
			"name": "invalid",
		}

		_, err := projectCollection.InsertOne(ctx, invalidDoc)
		require.NoError(t, err)

		err = AddProjectAlias(ctx, client)
		assert.NoError(t, err, "migration should not fail even with invalid documents")
	})
}
