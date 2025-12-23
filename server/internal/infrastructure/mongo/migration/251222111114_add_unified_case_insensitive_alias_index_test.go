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
	"go.mongodb.org/mongo-driver/mongo"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestAddUnifiedCaseInsensitiveAliasIndex ./internal/infrastructure/mongo/migration/...

func TestAddUnifiedCaseInsensitiveAliasIndex(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("handles empty aliases for both collections", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		storyID1 := primitive.NewObjectID()
		storyID2 := primitive.NewObjectID()

		// Insert scenes with empty aliases
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": ""},
			bson.M{"_id": sceneID2, "id": "scene2", "name": "Scene 2"}, // missing alias
		})
		require.NoError(t, err)

		// Insert storytelling with empty aliases
		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": "story1", "name": "Story 1", "alias": ""},
			bson.M{"_id": storyID2, "id": "story2", "name": "Story 2", "alias": nil},
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify scene aliases were generated
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "c-scene1", scene1["alias"])

		var scene2 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene2"}).Decode(&scene2)
		require.NoError(t, err)
		assert.Equal(t, "c-scene2", scene2["alias"])

		// Verify storytelling aliases were generated
		var story1 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story1"}).Decode(&story1)
		require.NoError(t, err)
		assert.Equal(t, "s-story1", story1["alias"])

		var story2 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story2"}).Decode(&story2)
		require.NoError(t, err)
		assert.Equal(t, "s-story2", story2["alias"])

		// Verify indexes were created
		assertIndexExists(t, ctx, db, "scene", "alias_case_insensitive_unique")
		assertIndexExists(t, ctx, db, "storytelling", "alias_case_insensitive_unique")
	})

	t.Run("handles duplicates within same collection", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		sceneID3 := primitive.NewObjectID()
		storyID1 := primitive.NewObjectID()
		storyID2 := primitive.NewObjectID()

		// Insert scenes with duplicate aliases (case-insensitive)
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": "duplicate-alias"},
			bson.M{"_id": sceneID2, "id": "scene2", "name": "Scene 2", "alias": "DUPLICATE-ALIAS"},
			bson.M{"_id": sceneID3, "id": "scene3", "name": "Scene 3", "alias": "unique-alias"},
		})
		require.NoError(t, err)

		// Insert storytelling with duplicate aliases (case-insensitive)
		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": "story1", "name": "Story 1", "alias": "story-duplicate"},
			bson.M{"_id": storyID2, "id": "story2", "name": "Story 2", "alias": "Story-Duplicate"},
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify scene duplicates were resolved
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "c-scene1", scene1["alias"])

		var scene2 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene2"}).Decode(&scene2)
		require.NoError(t, err)
		assert.Equal(t, "c-scene2", scene2["alias"])

		var scene3 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene3"}).Decode(&scene3)
		require.NoError(t, err)
		assert.Equal(t, "unique-alias", scene3["alias"]) // Should remain unchanged

		// Verify storytelling duplicates were resolved
		var story1 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story1"}).Decode(&story1)
		require.NoError(t, err)
		assert.Equal(t, "s-story1", story1["alias"])

		var story2 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story2"}).Decode(&story2)
		require.NoError(t, err)
		assert.Equal(t, "s-story2", story2["alias"])
	})

	t.Run("handles cross-collection conflicts", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		storyID1 := primitive.NewObjectID()
		storyID2 := primitive.NewObjectID()
		storyID3 := primitive.NewObjectID()

		// Insert scenes with aliases
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": "conflicted-alias"},
			bson.M{"_id": sceneID2, "id": "scene2", "name": "Scene 2", "alias": "another-conflict"},
		})
		require.NoError(t, err)

		// Insert storytelling with same aliases (case-insensitive conflicts)
		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": "story1", "name": "Story 1", "alias": "conflicted-alias"},   // Exact match
			bson.M{"_id": storyID2, "id": "story2", "name": "Story 2", "alias": "ANOTHER-CONFLICT"},   // Case insensitive match
			bson.M{"_id": storyID3, "id": "story3", "name": "Story 3", "alias": "unique-story-alias"}, // No conflict
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify scene aliases remain unchanged (they have priority)
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "conflicted-alias", scene1["alias"])

		var scene2 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene2"}).Decode(&scene2)
		require.NoError(t, err)
		assert.Equal(t, "another-conflict", scene2["alias"])

		// Verify storytelling aliases were changed due to conflicts
		var story1 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story1"}).Decode(&story1)
		require.NoError(t, err)
		assert.Equal(t, "s-story1", story1["alias"])

		var story2 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story2"}).Decode(&story2)
		require.NoError(t, err)
		assert.Equal(t, "s-story2", story2["alias"])

		// Verify non-conflicting storytelling alias remains unchanged
		var story3 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story3"}).Decode(&story3)
		require.NoError(t, err)
		assert.Equal(t, "unique-story-alias", story3["alias"])
	})

	t.Run("handles complex scenario with all conflict types", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		sceneID3 := primitive.NewObjectID()
		storyID1 := primitive.NewObjectID()
		storyID2 := primitive.NewObjectID()
		storyID3 := primitive.NewObjectID()

		// Complex test scenario:
		// - Empty aliases
		// - Internal duplicates
		// - Cross-collection conflicts
		// - Valid unique aliases

		// Insert scenes
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": ""},                  // Empty alias
			bson.M{"_id": sceneID2, "id": "scene2", "name": "Scene 2", "alias": "shared-name"},       // Will conflict with story
			bson.M{"_id": sceneID3, "id": "scene3", "name": "Scene 3", "alias": "valid-scene-alias"}, // Unique
		})
		require.NoError(t, err)

		// Insert storytelling
		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": "story1", "name": "Story 1"},                               // Missing alias
			bson.M{"_id": storyID2, "id": "story2", "name": "Story 2", "alias": "SHARED-NAME"},       // Conflicts with scene (case insensitive)
			bson.M{"_id": storyID3, "id": "story3", "name": "Story 3", "alias": "valid-story-alias"}, // Unique
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify results
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "c-scene1", scene1["alias"]) // Generated for empty

		var scene2 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene2"}).Decode(&scene2)
		require.NoError(t, err)
		assert.Equal(t, "shared-name", scene2["alias"]) // Kept (scene has priority)

		var scene3 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene3"}).Decode(&scene3)
		require.NoError(t, err)
		assert.Equal(t, "valid-scene-alias", scene3["alias"]) // Unchanged

		var story1 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story1"}).Decode(&story1)
		require.NoError(t, err)
		assert.Equal(t, "s-story1", story1["alias"]) // Generated for missing

		var story2 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story2"}).Decode(&story2)
		require.NoError(t, err)
		assert.Equal(t, "s-story2", story2["alias"]) // Changed due to conflict

		var story3 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story3"}).Decode(&story3)
		require.NoError(t, err)
		assert.Equal(t, "valid-story-alias", story3["alias"]) // Unchanged
	})

	t.Run("handles case insensitive duplicates correctly", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		sceneID3 := primitive.NewObjectID()

		// Insert scenes with various case combinations of the same alias
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": "test-alias"},
			bson.M{"_id": sceneID2, "id": "scene2", "name": "Scene 2", "alias": "Test-Alias"},
			bson.M{"_id": sceneID3, "id": "scene3", "name": "Scene 3", "alias": "TEST-ALIAS"},
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify all duplicates were resolved with unique aliases
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "c-scene1", scene1["alias"])

		var scene2 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene2"}).Decode(&scene2)
		require.NoError(t, err)
		assert.Equal(t, "c-scene2", scene2["alias"])

		var scene3 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene3"}).Decode(&scene3)
		require.NoError(t, err)
		assert.Equal(t, "c-scene3", scene3["alias"])
	})

	t.Run("preserves valid unique aliases", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		storyID1 := primitive.NewObjectID()

		// Insert documents with valid, unique aliases
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": "unique-scene"},
		})
		require.NoError(t, err)

		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": "story1", "name": "Story 1", "alias": "unique-story"},
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify aliases were preserved
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "unique-scene", scene1["alias"])

		var story1 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story1"}).Decode(&story1)
		require.NoError(t, err)
		assert.Equal(t, "unique-story", story1["alias"])
	})

	t.Run("handles mixed document types and field variations", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		storyID1 := primitive.NewObjectID()
		storyID2 := primitive.NewObjectID()

		// Insert scenes with different field scenarios
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": "scene1", "name": "Scene 1", "alias": nil}, // nil alias
			bson.M{"_id": sceneID2, "id": "scene2", "name": "Scene 2"},               // missing alias field
		})
		require.NoError(t, err)

		// Insert storytelling with different field scenarios
		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": "story1", "name": "Story 1", "alias": ""},    // empty string alias
			bson.M{"_id": storyID2, "id": "story2", "name": "Story 2", "alias": "   "}, // whitespace alias
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify all received proper aliases
		var scene1 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "c-scene1", scene1["alias"])

		var scene2 bson.M
		err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene2"}).Decode(&scene2)
		require.NoError(t, err)
		assert.Equal(t, "c-scene2", scene2["alias"])

		var story1 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story1"}).Decode(&story1)
		require.NoError(t, err)
		assert.Equal(t, "s-story1", story1["alias"])

		var story2 bson.M
		err = db.Collection("storytelling").FindOne(ctx, bson.M{"id": "story2"}).Decode(&story2)
		require.NoError(t, err)
		// Note: whitespace alias should be treated as valid if not empty, but this tests current behavior
		alias := story2["alias"].(string)
		assert.True(t, alias == "   " || alias == "s-story2", "alias should be either preserved whitespace or generated")
	})

	t.Run("creates indexes successfully", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		// Insert minimal test data
		sceneID := primitive.NewObjectID()
		storyID := primitive.NewObjectID()

		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID, "id": "scene1", "name": "Scene 1", "alias": "scene-alias"},
		})
		require.NoError(t, err)

		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID, "id": "story1", "name": "Story 1", "alias": "story-alias"},
		})
		require.NoError(t, err)

		// Execute migration
		err = AddUnifiedCaseInsensitiveAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify both indexes exist
		assertIndexExists(t, ctx, db, "scene", "alias_case_insensitive_unique")
		assertIndexExists(t, ctx, db, "storytelling", "alias_case_insensitive_unique")

		// Test that the indexes enforce uniqueness (case-insensitive)
		// This should fail due to the unique constraint
		_, err = db.Collection("scene").InsertOne(ctx, bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    "scene2",
			"name":  "Scene 2",
			"alias": "SCENE-ALIAS", // Same as existing but different case
		})
		assert.Error(t, err, "should fail due to unique constraint")

		_, err = db.Collection("storytelling").InsertOne(ctx, bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    "story2",
			"name":  "Story 2",
			"alias": "STORY-ALIAS", // Same as existing but different case
		})
		assert.Error(t, err, "should fail due to unique constraint")
	})
}

// Helper function to verify index exists
func assertIndexExists(t *testing.T, ctx context.Context, db *mongo.Database, collectionName, indexName string) {
	cursor, err := db.Collection(collectionName).Indexes().List(ctx)
	require.NoError(t, err)
	defer cursor.Close(ctx)

	indexFound := false
	for cursor.Next(ctx) {
		var index bson.M
		err := cursor.Decode(&index)
		require.NoError(t, err)
		if name, ok := index["name"].(string); ok && name == indexName {
			indexFound = true
			break
		}
	}

	assert.True(t, indexFound, "index %s should exist in collection %s", indexName, collectionName)
}

// Test helper functions individually
func TestFindCrossCollectionConflicts(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("identifies case insensitive conflicts", func(t *testing.T) {
		// Clean collections
		err := db.Collection("scene").Drop(ctx)
		require.NoError(t, err)
		err = db.Collection("storytelling").Drop(ctx)
		require.NoError(t, err)

		// Setup test data
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": primitive.NewObjectID(), "id": "scene1", "alias": "conflict-alias"},
			bson.M{"_id": primitive.NewObjectID(), "id": "scene2", "alias": "unique-scene"},
		})
		require.NoError(t, err)

		_, err = db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": primitive.NewObjectID(), "id": "story1", "alias": "CONFLICT-ALIAS"}, // Case different
			bson.M{"_id": primitive.NewObjectID(), "id": "story2", "alias": "unique-story"},
		})
		require.NoError(t, err)

		// Test the function
		sceneCol := db.Collection("scene")
		storytellingCol := db.Collection("storytelling")

		conflicts, err := findCrossCollectionConflicts(ctx, sceneCol, storytellingCol)
		assert.NoError(t, err)
		assert.Len(t, conflicts, 1)
		assert.Contains(t, conflicts, "conflict-alias")
	})
}

func TestGetAliasPrefix(t *testing.T) {
	assert.Equal(t, "c", getAliasPrefix("scene"))
	assert.Equal(t, "s", getAliasPrefix("storytelling"))
	assert.Equal(t, "x", getAliasPrefix("unknown"))
}
