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

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestSetProjectIdStorytelling ./internal/infrastructure/mongo/migration/...

func TestSetProjectIdStorytelling(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("basic case", func(t *testing.T) {
		setupTestData(t, ctx, client)

		err := SetProjectIdStorytelling(ctx, client)
		assert.NoError(t, err)

		verifyMigrationResult(t, ctx, client)
	})

	t.Run("scene not found", func(t *testing.T) {
		storytellingCollection := client.WithCollection("storytelling").Client()
		_, err := storytellingCollection.InsertOne(ctx, bson.M{
			"_id":      "story_no_scene",
			"id":       "01jzpkgkq61ebx9bdgc5kejb32",
			"property": "01jzpkgkq5g9epm0d3zpbvzkxw",
			"scene":    "nonexistent_scene_id",
			"title":    "test",
		})
		require.NoError(t, err)

		err = SetProjectIdStorytelling(ctx, client)
		assert.NoError(t, err)

		var result bson.M
		err = storytellingCollection.FindOne(ctx, bson.M{"_id": "story_no_scene"}).Decode(&result)
		assert.NoError(t, err)
		assert.NotContains(t, result, "project")
	})

	t.Run("empty collection", func(t *testing.T) {
		err := SetProjectIdStorytelling(ctx, client)
		assert.NoError(t, err)
	})
}

func setupTestData(t *testing.T, ctx context.Context, client DBClient) {

	sceneCollection := client.WithCollection("scene").Client()
	sceneData := []interface{}{
		bson.M{
			"_id":     "scene_1",
			"id":      "01jzpkgkjxxj53zxmn9rqc7z12",
			"project": "01jzpkgkexd9zxnv6pcc69f1k8",
			"team":    "01jzpkg72bh3yzv7y0hfajecp8",
		},
		bson.M{
			"_id":     "scene_2",
			"id":      "01jzpkgkjxxj53zxmn9rqc7z13",
			"project": "01jzpkgkexd9zxnv6pcc69f1k9",
			"team":    "01jzpkg72bh3yzv7y0hfajecp9",
		},
	}
	_, err := sceneCollection.InsertMany(ctx, sceneData)
	require.NoError(t, err)

	storytellingCollection := client.WithCollection("storytelling").Client()
	storytellingData := []interface{}{
		bson.M{
			"_id":      "story_1",
			"id":       "01jzpkgkq61ebx9bdgc5kejb32",
			"property": "01jzpkgkq5g9epm0d3zpbvzkxw",
			"scene":    "01jzpkgkjxxj53zxmn9rqc7z12",
			"title":    "デフォルト",
		},
		bson.M{
			"_id":      "story_2",
			"id":       "01jzpkgkq61ebx9bdgc5kejb33",
			"property": "01jzpkgkq5g9epm0d3zpbvzkxw",
			"scene":    "01jzpkgkjxxj53zxmn9rqc7z13",
			"title":    "テスト用",
		},
	}
	_, err = storytellingCollection.InsertMany(ctx, storytellingData)
	require.NoError(t, err)
}

func verifyMigrationResult(t *testing.T, ctx context.Context, client DBClient) {
	storytellingCollection := client.WithCollection("storytelling").Client()

	var result1 bson.M
	err := storytellingCollection.FindOne(ctx, bson.M{"_id": "story_1"}).Decode(&result1)
	require.NoError(t, err)
	assert.Equal(t, "01jzpkgkexd9zxnv6pcc69f1k8", result1["project"])

	var result2 bson.M
	err = storytellingCollection.FindOne(ctx, bson.M{"_id": "story_2"}).Decode(&result2)
	require.NoError(t, err)
	assert.Equal(t, "01jzpkgkexd9zxnv6pcc69f1k9", result2["project"])

	assert.Equal(t, "01jzpkgkq61ebx9bdgc5kejb32", result1["id"])
	assert.Equal(t, "01jzpkgkq5g9epm0d3zpbvzkxw", result1["property"])
	assert.Equal(t, "01jzpkgkjxxj53zxmn9rqc7z12", result1["scene"])
	assert.Equal(t, "デフォルト", result1["title"])
}
