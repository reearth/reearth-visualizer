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

// go test -v -run TestConverEmptyProjectAlias ./internal/infrastructure/mongo/migration/...

func TestConverEmptyProjectAlias(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()

	objectID1 := primitive.NewObjectID()
	objectID2 := primitive.NewObjectID()
	objectID3 := primitive.NewObjectID()
	objectID4 := primitive.NewObjectID()

	testDocs := []interface{}{
		// Document without projectalias field
		bson.M{
			"_id":  objectID1,
			"id":   "01jzvnj5tfkjrr227tahf2fvyb",
			"team": "01jzqb3qsgr17g8gc5x3qrb114",
			"name": "test1",
		},
		// Document with empty projectalias
		bson.M{
			"_id":          objectID2,
			"id":           "01jzvnj5tfkjrr227tahf2fvyc",
			"team":         "01jzqb3qsgr17g8gc5x3qrb115",
			"name":         "test2",
			"projectalias": "",
		},
		// Document with existing projectalias
		bson.M{
			"_id":          objectID3,
			"id":           "01jzvnj5tfkjrr227tahf2fvyd",
			"team":         "01jzqb3qsgr17g8gc5x3qrb116",
			"name":         "test3",
			"projectalias": "existing-alias",
		},
		// Document without id field (should be skipped)
		bson.M{
			"_id":  objectID4,
			"team": "01jzqb3qsgr17g8gc5x3qrb117",
			"name": "test4",
		},
	}

	_, err := projectCollection.InsertMany(ctx, testDocs)
	require.NoError(t, err)

	t.Run("before migration", func(t *testing.T) {
		// Check document without projectalias
		var doc1 bson.M
		err := projectCollection.FindOne(ctx, bson.M{"_id": objectID1}).Decode(&doc1)
		require.NoError(t, err)
		_, exists := doc1["projectalias"]
		assert.False(t, exists, "projectalias should not exist before migration")

		// Check document with empty projectalias
		var doc2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID2}).Decode(&doc2)
		require.NoError(t, err)
		projectalias, exists := doc2["projectalias"]
		assert.True(t, exists, "projectalias field should exist")
		assert.Equal(t, "", projectalias, "projectalias should be empty")

		// Check document with existing projectalias
		var doc3 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID3}).Decode(&doc3)
		require.NoError(t, err)
		projectalias, exists = doc3["projectalias"]
		assert.True(t, exists, "projectalias should exist")
		assert.Equal(t, "existing-alias", projectalias, "projectalias should remain unchanged")
	})

	t.Run("execute migration", func(t *testing.T) {
		err := ConverEmptyProjectAlias(ctx, client)
		require.NoError(t, err)
	})

	t.Run("after migration", func(t *testing.T) {
		// Check document that was missing projectalias
		var doc1 bson.M
		err := projectCollection.FindOne(ctx, bson.M{"_id": objectID1}).Decode(&doc1)
		require.NoError(t, err)
		projectalias1, exists := doc1["projectalias"]
		assert.True(t, exists, "projectalias should exist after migration")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvyb", projectalias1, "projectalias should be correct")

		// Check document that had empty projectalias
		var doc2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID2}).Decode(&doc2)
		require.NoError(t, err)
		projectalias2, exists := doc2["projectalias"]
		assert.True(t, exists, "projectalias should exist after migration")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvyc", projectalias2, "projectalias should be set from id")

		// Check document with existing projectalias (should remain unchanged)
		var doc3 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID3}).Decode(&doc3)
		require.NoError(t, err)
		projectalias3, exists := doc3["projectalias"]
		assert.True(t, exists, "projectalias should still exist")
		assert.Equal(t, "existing-alias", projectalias3, "projectalias should remain unchanged")

		// Check document without id field (should remain unchanged)
		var doc4 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID4}).Decode(&doc4)
		require.NoError(t, err)
		_, exists = doc4["projectalias"]
		assert.False(t, exists, "projectalias should not be added to documents without id")
	})

	t.Run("duplicate migration", func(t *testing.T) {
		// Run migration again to ensure idempotency
		require.NoError(t, err)
		err := ConverEmptyProjectAlias(ctx, client)

		// Verify that existing aliases are not changed
		var doc1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID1}).Decode(&doc1)
		require.NoError(t, err)
		projectalias, exists := doc1["projectalias"]
		assert.True(t, exists, "projectalias should still exist")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvyb", projectalias, "projectalias should remain unchanged")

		var doc3 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID3}).Decode(&doc3)
		require.NoError(t, err)
		projectalias, exists = doc3["projectalias"]
		assert.True(t, exists, "projectalias should still exist")
		assert.Equal(t, "existing-alias", projectalias, "existing projectalias should remain unchanged")
	})

	t.Run("verify processed documents", func(t *testing.T) {
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		processedCount := 0
		skippedCount := 0

		for cursor.Next(ctx) {
			var doc bson.M
			err := cursor.Decode(&doc)
			require.NoError(t, err)

			if _, hasID := doc["id"]; hasID {
				projectalias, exists := doc["projectalias"]
				assert.True(t, exists, "documents with id should have projectalias")
				if exists {
					aliasStr := projectalias.(string)
					assert.NotEmpty(t, aliasStr, "projectalias should not be empty")
					if aliasStr != "existing-alias" {
						assert.Contains(t, aliasStr, "p-", "generated projectalias should start with 'p-'")
					}
				}
				processedCount++
			} else {
				_, exists := doc["projectalias"]
				assert.False(t, exists, "documents without id should not have projectalias")
				skippedCount++
			}
		}

		assert.Equal(t, 3, processedCount, "should process 3 documents with id")
		assert.Equal(t, 1, skippedCount, "should skip 1 document without id")
	})
}

func TestConverEmptyProjectAlias_EdgeCases(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()

	t.Run("document with non-string id", func(t *testing.T) {
		invalidDoc := bson.M{
			"_id":  primitive.NewObjectID(),
			"id":   123, // non-string id
			"team": "01jzqb3qsgr17g8gc5x3qrb116",
			"name": "invalid",
		}

		_, err := projectCollection.InsertOne(ctx, invalidDoc)
		require.NoError(t, err)

		err = ConverEmptyProjectAlias(ctx, client)
		assert.NoError(t, err, "migration should not fail with non-string id")

		// Verify the document was not updated
		var doc bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": 123}).Decode(&doc)
		require.NoError(t, err)
		_, exists := doc["projectalias"]
		assert.False(t, exists, "projectalias should not be added for non-string id")
	})

	t.Run("document with nil projectalias", func(t *testing.T) {
		objectID := primitive.NewObjectID()
		docWithNil := bson.M{
			"_id":          objectID,
			"id":           "01jzvnj5tfkjrr227tahf2fvye",
			"team":         "01jzqb3qsgr17g8gc5x3qrb118",
			"name":         "test-nil",
			"projectalias": nil,
		}

		_, err := projectCollection.InsertOne(ctx, docWithNil)
		require.NoError(t, err)

		err = ConverEmptyProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify the document was updated
		var doc bson.M
		err = projectCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&doc)
		require.NoError(t, err)
		projectalias, exists := doc["projectalias"]
		assert.True(t, exists, "projectalias should exist after migration")
		assert.Equal(t, "p-01jzvnj5tfkjrr227tahf2fvye", projectalias, "projectalias should be generated from id")
	})

	t.Run("empty collection", func(t *testing.T) {
		// Clear collection
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Run migration on empty collection
		err = ConverEmptyProjectAlias(ctx, client)
		assert.NoError(t, err, "migration should not fail on empty collection")
	})
}
