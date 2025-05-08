package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestUpdateAlias ./internal/infrastructure/mongo/migration/...

func TestUpdateAlias(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	t.Run("updates alias where empty, null, or missing", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()
		id4 := primitive.NewObjectID()

		_, err := db.Collection("project").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": "item1", "name": "Project 1", "alias": ""},
			bson.M{"_id": id2, "id": "item2", "name": "Project 2"}, // alias missing
			bson.M{"_id": id3, "id": "item3", "name": "Project 3", "alias": nil},
			bson.M{"_id": id4, "id": "item4", "name": "Project 4", "alias": "existing-alias"},
		})
		assert.NoError(t, err)

		err = updateEmptyAliases(ctx, client, "project", "p-")
		assert.NoError(t, err)

		var results []bson.M
		cursor, err := db.Collection("project").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)
		assert.Len(t, results, 4)

		for _, doc := range results {
			alias, _ := doc["alias"].(string)
			id := doc["_id"].(primitive.ObjectID)

			if id == id4 {
				assert.Equal(t, "existing-alias", alias)
			} else {
				assert.Equal(t, "p-"+id.Hex(), alias)
			}
		}
	})

	t.Run("updates alias where empty, null, or missing", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()
		id4 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": "item1", "name": "Storytelling 1", "alias": ""},
			bson.M{"_id": id2, "id": "item2", "name": "Storytelling 2"}, // alias missing
			bson.M{"_id": id3, "id": "item3", "name": "Storytelling 3", "alias": nil},
			bson.M{"_id": id4, "id": "item4", "name": "Storytelling 4", "alias": "existing-alias"},
		})
		assert.NoError(t, err)

		err = updateEmptyAliases(ctx, client, "storytelling", "s-")
		assert.NoError(t, err)

		var results []bson.M
		cursor, err := db.Collection("storytelling").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)
		assert.Len(t, results, 4)

		for _, doc := range results {
			alias, _ := doc["alias"].(string)
			id := doc["_id"].(primitive.ObjectID)

			if id == id4 {
				assert.Equal(t, "existing-alias", alias)
			} else {
				assert.Equal(t, "s-"+id.Hex(), alias)
			}
		}
	})
}
