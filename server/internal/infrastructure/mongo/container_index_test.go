package mongo

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

func indexUniqueByName(t *testing.T, ctx context.Context, col *mongo.Collection) map[string]bool {
	t.Helper()
	cur, err := col.Indexes().List(ctx)
	require.NoError(t, err)
	var specs []struct {
		Name   string `bson:"name"`
		Unique bool   `bson:"unique"`
	}
	require.NoError(t, cur.All(ctx, &specs))
	res := map[string]bool{}
	for _, s := range specs {
		res[s.Name] = s.Unique
	}
	return res
}

func TestCreateIndexes_SkipsIndexesWithOtherUniqueness(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	story := db.Collection("storytelling")
	_, err := story.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "scene", Value: 1}}, Options: options.Index().SetUnique(true)},
	})
	require.NoError(t, err)

	meta := db.Collection("projectmetadata")
	_, err = meta.Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "id", Value: 1}}})
	require.NoError(t, err)

	require.NoError(t, createIndexes(ctx, client.WithCollection("storytelling"), storytellingIndexes, storytellingUniqueIndexes))
	require.NoError(t, createIndexes(ctx, client.WithCollection("projectmetadata"), projectmetadataIndexes, projectmetadataUniqueIndexes))

	storyIndexes := indexUniqueByName(t, ctx, story)
	assert.True(t, storyIndexes["scene_1"])
	assert.True(t, storyIndexes["id_1"])
	assert.Contains(t, storyIndexes, "alias_1")
	assert.Contains(t, storyIndexes, "alias_1_status_1")

	metaIndexes := indexUniqueByName(t, ctx, meta)
	assert.False(t, metaIndexes["id_1"])
	assert.Contains(t, metaIndexes, "project_1")

	require.NoError(t, createIndexes(ctx, client.WithCollection("storytelling"), storytellingIndexes, storytellingUniqueIndexes))
	require.NoError(t, createIndexes(ctx, client.WithCollection("projectmetadata"), projectmetadataIndexes, projectmetadataUniqueIndexes))
	assert.Equal(t, storyIndexes, indexUniqueByName(t, ctx, story))
	assert.Equal(t, metaIndexes, indexUniqueByName(t, ctx, meta))
}
