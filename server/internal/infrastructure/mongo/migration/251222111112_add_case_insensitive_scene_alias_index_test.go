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
// go test -v -run TestAddCaseInsensitiveSceneAliasIndex ./internal/infrastructure/mongo/migration/...

func TestAddCaseInsensitiveSceneAliasIndex(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("handles empty aliases, duplicates and creates index", func(t *testing.T) {
		sceneID1 := primitive.NewObjectID()
		sceneID2 := primitive.NewObjectID()
		sceneID3 := primitive.NewObjectID()
		sceneID4 := primitive.NewObjectID()

		// Insert test scene documents - unique, empty, and duplicate aliases
		_, err := db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": sceneID1, "id": sceneID1.Hex(), "project": "project1", "alias": "unique-alias"},
			bson.M{"_id": sceneID2, "id": sceneID2.Hex(), "project": "project2", "alias": "Duplicate-Alias"},
			bson.M{"_id": sceneID3, "id": sceneID3.Hex(), "project": "project3", "alias": "duplicate-alias"},
			bson.M{"_id": sceneID4, "id": sceneID4.Hex(), "project": "project4", "alias": ""},
		})
		assert.NoError(t, err)

		// Run the full migration
		err = AddCaseInsensitiveSceneAliasIndex(ctx, client)
		assert.NoError(t, err)

		// Verify results
		var results []mongodoc.SceneDocument
		cursor, err := db.Collection("scene").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)
		assert.Len(t, results, 4)

		for _, doc := range results {
			if doc.ID == sceneID1.Hex() {
				// Unique alias should be preserved
				assert.Equal(t, "unique-alias", doc.Alias)
			} else if doc.ID == sceneID2.Hex() || doc.ID == sceneID3.Hex() || doc.ID == sceneID4.Hex() {
				// Duplicate aliases and empty aliases should be updated to c-{ID} format
				expectedAlias := "c-" + doc.ID
				assert.Equal(t, expectedAlias, doc.Alias)
			}
		}
	})
}

func TestFindDuplicateSceneAliases(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("finds case-insensitive duplicates", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()

		_, err := db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "alias": "Test-Alias"},
			bson.M{"_id": id2, "alias": "test-alias"},
			bson.M{"_id": id3, "alias": "unique-alias"},
		})
		assert.NoError(t, err)

		duplicates, err := FindDuplicateSceneAliases(ctx, db.Collection("scene"))
		assert.NoError(t, err)

		assert.Contains(t, duplicates, "test-alias")
		assert.Len(t, duplicates["test-alias"], 2)
		assert.NotContains(t, duplicates, "unique-alias")
	})

	t.Run("ignores empty aliases", func(t *testing.T) {
		id4 := primitive.NewObjectID()
		id5 := primitive.NewObjectID()

		_, err := db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": id4, "alias": ""},
			bson.M{"_id": id5, "alias": ""},
		})
		assert.NoError(t, err)

		duplicates, err := FindDuplicateSceneAliases(ctx, db.Collection("scene"))
		assert.NoError(t, err)

		assert.NotContains(t, duplicates, "")
	})
}

func TestGenerateNewAliasesForDuplicateScenes(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("generates new aliases for all duplicates", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()

		_, err := db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": id1.Hex(), "project": "project1", "alias": "duplicate"},
			bson.M{"_id": id2, "id": id2.Hex(), "project": "project2", "alias": "duplicate"},
		})
		assert.NoError(t, err)

		duplicates := map[string][]interface{}{
			"duplicate": {id1, id2},
		}

		col := mongox.NewCollection(db.Collection("scene"))
		err = GenerateNewAliasesForDuplicateScenes(ctx, col, duplicates)
		assert.NoError(t, err)

		// Verify both documents got new aliases
		var results []mongodoc.SceneDocument
		cursor, err := db.Collection("scene").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)

		for _, doc := range results {
			expectedAlias := "c-" + doc.ID
			assert.Equal(t, expectedAlias, doc.Alias)
		}
	})
}

func TestFindEmptyAliasScenes(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("finds empty and missing aliases", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()
		id4 := primitive.NewObjectID()

		_, err := db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "alias": ""},
			bson.M{"_id": id2, "alias": nil},
			bson.M{"_id": id3}, // missing alias field
			bson.M{"_id": id4, "alias": "has-alias"},
		})
		assert.NoError(t, err)

		emptyScenes, err := FindEmptyAliasScenes(ctx, db.Collection("scene"))
		assert.NoError(t, err)

		assert.Len(t, emptyScenes, 3)
		assert.Contains(t, emptyScenes, id1)
		assert.Contains(t, emptyScenes, id2)
		assert.Contains(t, emptyScenes, id3)
		assert.NotContains(t, emptyScenes, id4)
	})
}

func TestGenerateAliasesForEmptyScenes(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	t.Run("generates new aliases for empty scenes", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()

		_, err := db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": id1.Hex(), "project": "project1", "alias": ""},
			bson.M{"_id": id2, "id": id2.Hex(), "project": "project2", "alias": nil},
		})
		assert.NoError(t, err)

		emptyScenes := []interface{}{id1, id2}

		col := mongox.NewCollection(db.Collection("scene"))
		err = GenerateAliasesForEmptyScenes(ctx, col, emptyScenes)
		assert.NoError(t, err)

		// Verify both documents got new aliases
		var results []mongodoc.SceneDocument
		cursor, err := db.Collection("scene").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)

		for _, doc := range results {
			expectedAlias := "c-" + doc.ID
			assert.Equal(t, expectedAlias, doc.Alias)
		}
	})
}