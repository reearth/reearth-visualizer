package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

// go test -v -run TestSetVisibilityPublic ./internal/infrastructure/mongo/migration/...

func TestSetVisibilityPublic(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()

	testProjects := []interface{}{
		bson.M{
			"id":         "01k0rpgzzxb8afnast3008ndde",
			"workspace":  "01k0rpgh7em0h3atf0qtsz9kcg",
			"name":       "test1",
			"visibility": "private",
		},
		bson.M{
			"id":         "01k0rpgzzxb8afnast3008nddf",
			"workspace":  "01k0rpgh7em0h3atf0qtsz9kcg",
			"name":       "test2",
			"visibility": nil,
		},
		bson.M{
			"id":         "01k0rpgzzxb8afnast3008nddg",
			"workspace":  "01k0rpgh7em0h3atf0qtsz9kcg",
			"name":       "test3",
			"visibility": "public", // already public
		},
	}

	_, err := projectCollection.InsertMany(ctx, testProjects)
	assert.NoError(t, err)

	err = SetVisibilityPublic(ctx, client)
	assert.NoError(t, err)

	cursor, err := projectCollection.Find(ctx, bson.M{})
	assert.NoError(t, err)
	defer cursor.Close(ctx)

	var results []bson.M
	err = cursor.All(ctx, &results)
	assert.NoError(t, err)

	for _, result := range results {
		assert.Equal(t, "public", result["visibility"])
	}

	assert.Equal(t, 3, len(results))
}
