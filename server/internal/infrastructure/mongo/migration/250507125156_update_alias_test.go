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

	t.Run("updates alias for project using scene.id", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()
		id4 := primitive.NewObjectID()

		// Insert test project documents
		_, err := db.Collection("project").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": "item1", "name": "Project 1", "alias": ""},
			bson.M{"_id": id2, "id": "item2", "name": "Project 2"}, // alias missing
			bson.M{"_id": id3, "id": "item3", "name": "Project 3", "alias": nil},
			bson.M{"_id": id4, "id": "item4", "name": "Project 4", "alias": "existing-alias"},
		})
		assert.NoError(t, err)

		// Insert corresponding scenes for item1–item3
		_, err = db.Collection("scene").InsertMany(ctx, []interface{}{
			bson.M{"id": "scene1", "project": "item1"},
			bson.M{"id": "scene2", "project": "item2"},
			bson.M{"id": "scene3", "project": "item3"},
		})
		assert.NoError(t, err)

		err = updateEmptyAliases(ctx, client, "project", "c-")
		assert.NoError(t, err)

		var results []bson.M
		cursor, err := db.Collection("project").Find(ctx, bson.M{})
		assert.NoError(t, err)
		err = cursor.All(ctx, &results)
		assert.NoError(t, err)
		assert.Len(t, results, 4)

		for _, doc := range results {
			id := doc["id"].(string)
			alias := doc["alias"].(string)

			switch id {
			case "item1":
				assert.Equal(t, "c-scene1", alias)
			case "item2":
				assert.Equal(t, "c-scene2", alias)
			case "item3":
				assert.Equal(t, "c-scene3", alias)
			case "item4":
				assert.Equal(t, "existing-alias", alias)
			default:
				t.Errorf("unexpected id: %s", id)
			}
		}
	})

	t.Run("updates alias for storytelling using _id", func(t *testing.T) {
		id1 := primitive.NewObjectID()
		id2 := primitive.NewObjectID()
		id3 := primitive.NewObjectID()
		id4 := primitive.NewObjectID()

		_, err := db.Collection("storytelling").InsertMany(ctx, []interface{}{
			bson.M{"_id": id1, "id": "item1", "name": "Storytelling 1", "alias": ""},
			bson.M{"_id": id2, "id": "item2", "name": "Storytelling 2"},
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
			id := doc["_id"].(primitive.ObjectID)
			alias := doc["alias"].(string)

			if id == id4 {
				assert.Equal(t, "existing-alias", alias)
			} else {
				assert.Equal(t, "s-"+id.Hex(), alias)
			}
		}
	})
}
