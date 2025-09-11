package migration

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// go test -v -run TestConvertProjectMetadataId ./internal/infrastructure/mongo/migration/...

func TestConvertProjectMetadataId(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	collection := client.WithCollection("projectmetadata").Client()

	t.Run("successfully converts UUID IDs to ULIDs", func(t *testing.T) {
		// Setup: Insert test data with UUID format IDs
		testData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "550e8400-e29b-41d4-a716-446655440000", // UUID format
				"workspace": "workspace1",
				"project":   "project1",
				"readme":    "Test readme 1",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // UUID format
				"workspace": "workspace2",
				"project":   "project2",
				"readme":    "Test readme 2",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "01H4VXJZ9XQZQY8ZB5K6M7N8P9", // Already ULID format
				"workspace": "workspace3",
				"project":   "project3",
				"readme":    "Test readme 3",
			},
		}

		_, err := collection.InsertMany(ctx, testData)
		require.NoError(t, err)

		// Execute migration
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Verify that UUID format IDs have been converted
		cursor, err := collection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var documents []bson.M
		err = cursor.All(ctx, &documents)
		require.NoError(t, err)

		assert.Equal(t, 3, len(documents), "Should have 3 documents")

		uuidCount := 0
		ulidCount := 0

		for _, doc := range documents {
			id, ok := doc["id"].(string)
			require.True(t, ok, "ID should be a string")

			// Check if it's UUID format (contains dashes)
			if len(id) == 36 && id[8] == '-' && id[13] == '-' && id[18] == '-' && id[23] == '-' {
				uuidCount++
			} else if len(id) >= 20 { // ULID format (26 characters, but could be different lengths)
				ulidCount++
			}
		}

		assert.Equal(t, 0, uuidCount, "No documents should have UUID format IDs after migration")
		assert.Equal(t, 3, ulidCount, "All documents should have ULID format IDs after migration")

		// Verify specific documents were updated correctly
		var doc1 bson.M
		err = collection.FindOne(ctx, bson.M{"workspace": "workspace1"}).Decode(&doc1)
		require.NoError(t, err)
		assert.NotEqual(t, "550e8400-e29b-41d4-a716-446655440000", doc1["id"], "Original UUID ID should be changed")
		assert.Equal(t, "workspace1", doc1["workspace"], "Other fields should remain unchanged")
		assert.Equal(t, "Test readme 1", doc1["readme"], "Other fields should remain unchanged")
	})

	t.Run("handles empty collection gracefully", func(t *testing.T) {
		// Clear collection
		_, err := collection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Execute migration on empty collection
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Verify collection is still empty
		count, err := collection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)
	})

	t.Run("handles documents without UUID format IDs", func(t *testing.T) {
		// Setup: Insert documents with non-UUID IDs
		testData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "01H4VXJZ9XQZQY8ZB5K6M7N8P9", // ULID format
				"workspace": "workspace1",
				"project":   "project1",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "simple-id", // Simple string ID
				"workspace": "workspace2",
				"project":   "project2",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "12345", // Numeric string ID
				"workspace": "workspace3",
				"project":   "project3",
			},
		}

		_, err := collection.InsertMany(ctx, testData)
		require.NoError(t, err)

		// Execute migration
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Verify documents are unchanged
		var doc1 bson.M
		err = collection.FindOne(ctx, bson.M{"workspace": "workspace1"}).Decode(&doc1)
		require.NoError(t, err)
		assert.Equal(t, "01H4VXJZ9XQZQY8ZB5K6M7N8P9", doc1["id"])

		var doc2 bson.M
		err = collection.FindOne(ctx, bson.M{"workspace": "workspace2"}).Decode(&doc2)
		require.NoError(t, err)
		assert.Equal(t, "simple-id", doc2["id"])

		var doc3 bson.M
		err = collection.FindOne(ctx, bson.M{"workspace": "workspace3"}).Decode(&doc3)
		require.NoError(t, err)
		assert.Equal(t, "12345", doc3["id"])
	})

	t.Run("handles large number of documents", func(t *testing.T) {
		// Clear collection
		_, err := collection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert many documents with UUID format IDs
		var testData []interface{}
		for i := 0; i < 100; i++ {
			// Generate UUID-like IDs
			uuidID := "550e8400-e29b-41d4-a716-44665544" + fmt.Sprintf("%04d", i)
			testData = append(testData, bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        uuidID,
				"workspace": fmt.Sprintf("workspace%d", i),
				"project":   fmt.Sprintf("project%d", i),
			})
		}

		_, err = collection.InsertMany(ctx, testData)
		require.NoError(t, err)

		// Execute migration
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Verify all documents have been converted
		uuidCount, err := collection.CountDocuments(ctx, bson.M{
			"id": bson.M{
				"$regex": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
			},
		})
		require.NoError(t, err)
		assert.Equal(t, int64(0), uuidCount, "No documents should have UUID format IDs after migration")

		totalCount, err := collection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(100), totalCount, "All 100 documents should still exist")
	})

	t.Run("idempotent - running migration twice has no additional effect", func(t *testing.T) {
		// Clear collection
		_, err := collection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert test data with UUID format ID
		testData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "550e8400-e29b-41d4-a716-446655440000", // UUID format
				"workspace": "workspace1",
				"project":   "project1",
			},
		}

		_, err = collection.InsertMany(ctx, testData)
		require.NoError(t, err)

		// Run migration first time
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Get the converted ID
		var doc bson.M
		err = collection.FindOne(ctx, bson.M{"workspace": "workspace1"}).Decode(&doc)
		require.NoError(t, err)
		convertedID := doc["id"].(string)

		// Verify it's not the original UUID
		assert.NotEqual(t, "550e8400-e29b-41d4-a716-446655440000", convertedID)

		// Run migration second time
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Verify ID remains the same
		err = collection.FindOne(ctx, bson.M{"workspace": "workspace1"}).Decode(&doc)
		require.NoError(t, err)
		assert.Equal(t, convertedID, doc["id"].(string), "ID should remain unchanged on second migration run")

		// Verify only one document exists
		count, err := collection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(1), count)
	})

	t.Run("handles malformed ID fields gracefully", func(t *testing.T) {
		// Clear collection
		_, err := collection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert documents with non-string ID fields
		testData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        123, // Numeric ID
				"workspace": "workspace1",
				"project":   "project1",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"workspace": "workspace2", // Missing ID field
				"project":   "project2",
			},
		}

		_, err = collection.InsertMany(ctx, testData)
		require.NoError(t, err)

		// Execute migration (should not crash)
		err = ConvertProjectMetadataId(ctx, client)
		require.NoError(t, err)

		// Verify documents are unchanged
		count, err := collection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(2), count, "Both documents should still exist")
	})
}
