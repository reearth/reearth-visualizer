package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestAddCaseInsensitiveStorytellingAliasIndex ./internal/infrastructure/mongo/migration/...

func TestAddCaseInsensitiveStorytellingAliasIndex(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("handles empty aliases, duplicates and creates index", func(t *testing.T) {
		storyID1 := primitive.NewObjectID()
		storyID2 := primitive.NewObjectID()
		storyID3 := primitive.NewObjectID()
		storyID4 := primitive.NewObjectID()

		// Insert test storytelling documents - unique, empty, and duplicate aliases
		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": storyID1, "id": storyID1.Hex(), "scene": "scene1", "alias": "unique-story"},
			bson.M{"_id": storyID2, "id": storyID2.Hex(), "scene": "scene2", "alias": "Duplicate-Story"},
			bson.M{"_id": storyID3, "id": storyID3.Hex(), "scene": "scene3", "alias": "duplicate-story"},
			bson.M{"_id": storyID4, "id": storyID4.Hex(), "scene": "scene4", "alias": ""},
		})
		assert.NoError(t, err)

		// Run the full migration
		err = AddCaseInsensitiveStorytellingAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify results
		var results []mongodoc.StorytellingDocument
		cursor, err := db.Collection("storytelling").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)
		assert.Len(t, results, 4)

		for _, doc := range results {
			if doc.Id == storyID1.Hex() {
				// Unique alias should be preserved
				assert.Equal(t, "unique-story", doc.Alias)
			} else if doc.Id == storyID2.Hex() || doc.Id == storyID3.Hex() || doc.Id == storyID4.Hex() {
				// Duplicate aliases and empty aliases should be updated to s-{ID} format
				expectedAlias := "s-" + doc.Id
				assert.Equal(t, expectedAlias, doc.Alias)
			}
		}
	})
}

func TestFindDuplicateStorytellingAliases(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("finds case-insensitive duplicates", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "alias": "Test-Story"},
			bson.M{"_id": id2, "alias": "test-story"},
			bson.M{"_id": id3, "alias": "unique-story"},
		})
		assert.NoError(t, err)

		duplicates, err := FindDuplicateStorytellingAliases(ctx, db.Collection("storytelling"))
		assert.NoError(t, err)

		assert.Contains(t, duplicates, "test-story")
		assert.Len(t, duplicates["test-story"], 2)
		assert.NotContains(t, duplicates, "unique-story")
	})

	t.Run("ignores empty aliases", func(t *testing.T) {
		id4 := primitive.NewObjectID()
		id5 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id4, "alias": ""},
			bson.M{"_id": id5, "alias": ""},
		})
		assert.NoError(t, err)

		duplicates, err := FindDuplicateStorytellingAliases(ctx, db.Collection("storytelling"))
		assert.NoError(t, err)

		assert.NotContains(t, duplicates, "")
	})
}

func TestGenerateNewAliasesForDuplicateStorytelling(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("generates new aliases for all duplicates", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": id1.Hex(), "scene": "scene1", "alias": "duplicate"},
			bson.M{"_id": id2, "id": id2.Hex(), "scene": "scene2", "alias": "duplicate"},
		})
		assert.NoError(t, err)

		duplicates := map[string][]interface{}{
			"duplicate": {id1, id2},
		}

		col := mongox.NewCollection(db.Collection("storytelling"))
		err = GenerateNewAliasesForDuplicateStorytelling(ctx, col, duplicates)
		assert.NoError(t, err)

		// Verify both documents got new aliases
		var results []mongodoc.StorytellingDocument
		cursor, err := db.Collection("storytelling").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)

		for _, doc := range results {
			expectedAlias := "s-" + doc.Id
			assert.Equal(t, expectedAlias, doc.Alias)
		}
	})
}

func TestFindEmptyAliasStorytelling(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("finds empty and missing aliases", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()
		id4 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "alias": ""},
			bson.M{"_id": id2, "alias": nil},
			bson.M{"_id": id3}, // missing alias field
			bson.M{"_id": id4, "alias": "has-alias"},
		})
		assert.NoError(t, err)

		emptyStorytelling, err := FindEmptyAliasStorytelling(ctx, db.Collection("storytelling"))
		assert.NoError(t, err)

		assert.Len(t, emptyStorytelling, 3)
		assert.Contains(t, emptyStorytelling, id1)
		assert.Contains(t, emptyStorytelling, id2)
		assert.Contains(t, emptyStorytelling, id3)
		assert.NotContains(t, emptyStorytelling, id4)
	})
}

func TestGenerateAliasesForEmptyStorytelling(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("generates new aliases for empty storytelling", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": id1.Hex(), "scene": "scene1", "alias": ""},
			bson.M{"_id": id2, "id": id2.Hex(), "scene": "scene2", "alias": nil},
		})
		assert.NoError(t, err)

		emptyStorytelling := []interface{}{id1, id2}

		col := mongox.NewCollection(db.Collection("storytelling"))
		err = GenerateAliasesForEmptyStorytelling(ctx, col, emptyStorytelling)
		assert.NoError(t, err)

		// Verify both documents got new aliases
		var results []mongodoc.StorytellingDocument
		cursor, err := db.Collection("storytelling").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)

		for _, doc := range results {
			expectedAlias := "s-" + doc.Id
			assert.Equal(t, expectedAlias, doc.Alias)
		}
	})
}
