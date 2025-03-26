package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestDeleteJunkDataJob_Process(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("successful processing", func(t *testing.T) {
		_, err := db.Collection("scene").InsertOne(ctx, bson.M{"id": "scene1"})
		assert.NoError(t, err)

		_, err = db.Collection("nlsLayer").InsertMany(ctx, []interface{}{
			bson.M{"id": "item1", "scene": "scene1"},
			bson.M{"id": "item2", "scene": "scene2"},
			bson.M{"id": "item3"},
		})
		assert.NoError(t, err)

		job := &DeleteJunkDataJob{
			collections: []string{"nlsLayer"},
		}

		err = job.Process(ctx, client)
		assert.NoError(t, err)

		count, err := db.Collection("nlsLayer").CountDocuments(ctx, bson.M{})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), count)

		var remaining bson.M
		err = db.Collection("nlsLayer").FindOne(ctx, bson.M{}).Decode(&remaining)
		assert.NoError(t, err)
		assert.Equal(t, "item1", remaining["id"])
	})

	t.Run("empty collection", func(t *testing.T) {
		job := &DeleteJunkDataJob{
			collections: []string{"emptyCollection"},
		}

		err := job.Process(ctx, client)
		assert.NoError(t, err)
	})
}

func TestDeleteJunkDataJob_processBatch(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("delete items with missing scene", func(t *testing.T) {
		_, err := db.Collection("scene").InsertOne(ctx, bson.M{"id": "scene1"})
		assert.NoError(t, err)

		batch := []map[string]any{
			{"id": "item1", "scene": "scene1"},
			{"id": "item2", "scene": "scene2"},
			{"id": "item3"},
		}

		_, err = db.Collection("testCollection").InsertMany(ctx, []interface{}{
			batch[0],
			batch[1],
			batch[2],
		})
		assert.NoError(t, err)

		job := &DeleteJunkDataJob{}

		err = job.processBatch(ctx, client, "testCollection", batch)
		assert.NoError(t, err)

		count, err := db.Collection("testCollection").CountDocuments(ctx, bson.M{})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), count) // scene1 only
	})
}

func TestNewDeleteJunkDataJob(t *testing.T) {
	job := NewDeleteJunkDataJob()
	assert.NotNil(t, job)
	assert.NotEmpty(t, job.collections)
	assert.Contains(t, job.collections, "nlsLayer")
	assert.Contains(t, job.collections, "plugin")
}
