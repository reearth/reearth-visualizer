package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestSetProjectVisibility(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("updates all project documents with visibility=private", func(t *testing.T) {

		_, err := db.Collection("project").InsertMany(ctx, []interface{}{
			bson.M{"_id": "p1", "id": "item1", "name": "Project 1"},
			bson.M{"_id": "p2", "id": "item2", "name": "Project 2", "visibility": "public"},
			bson.M{"_id": "p3", "id": "item3", "name": "Project 3"},
		})
		assert.NoError(t, err)

		err = SetProjectVisibility(ctx, client)
		assert.NoError(t, err)

		cursor, err := db.Collection("project").Find(ctx, bson.M{})
		assert.NoError(t, err)

		var results []bson.M
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)
		assert.Len(t, results, 3)

		for _, doc := range results {
			assert.Equal(t, "private", doc["visibility"])
		}
	})

	t.Run("no documents in collection", func(t *testing.T) {
		err := db.Collection("project").Drop(ctx)
		assert.NoError(t, err)

		err = SetProjectVisibility(ctx, client)
		assert.NoError(t, err)

		count, err := db.Collection("project").CountDocuments(ctx, bson.M{})
		assert.NoError(t, err)
		assert.Equal(t, int64(0), count)
	})
}
