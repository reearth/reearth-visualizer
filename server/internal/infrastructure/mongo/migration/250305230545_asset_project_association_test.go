package migration

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// go test -v -run TestAssetProjectAssociation ./internal/infrastructure/mongo/migration/...

func TestAssetProjectAssociation(t *testing.T) {

	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	_, err := setupAssetDB(db, ctx)
	assert.NoError(t, err)

	_, err = setupProjectDB(db, ctx)
	assert.NoError(t, err)

	_, err = setupSceneDB(db, ctx)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "nlsLayer")
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "storytelling")
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "style")
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "property")
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "propertySchema")
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "plugin")
	assert.NoError(t, err)

	assert.NoError(t, AssetProjectAssociation(ctx, client))

	cursor, err := db.Collection("asset").Find(ctx, bson.M{})
	assert.NoError(t, err, "Failed to retrieve data after function execution")

	var results []bson.M
	err = cursor.All(ctx, &results)
	assert.NoError(t, err, "Failed to decode results")

	for i := range results {
		delete(results[i], "_id")
	}

	expected := []bson.M{
		{"project": "project1", "url": "http://localhost:8080/assets/project1-1"},
		{"project": "project1", "url": "http://localhost:8080/assets/project1-2"},
		{"project": "project1", "url": "http://localhost:8080/assets/project1-3"},
		{"project": "project2", "url": "http://localhost:8080/assets/project2-1"},
		{"project": "project2", "url": "http://localhost:8080/assets/project2-2"},
		{"project": "project2", "url": "http://localhost:8080/assets/project2-3"},
		{"project": "scene1", "url": "http://localhost:8080/assets/scene1-1"},
		{"project": "scene1", "url": "http://localhost:8080/assets/scene1-2"},
		{"project": "scene1", "url": "http://localhost:8080/assets/scene1-3"},
		{"project": "scene2", "url": "http://localhost:8080/assets/scene2-1"},
		{"project": "scene2", "url": "http://localhost:8080/assets/scene2-2"},
		{"project": "scene2", "url": "http://localhost:8080/assets/scene2-3"},
		{"project": "nlsLayer1", "url": "http://localhost:8080/assets/nlsLayer1-1"},
		{"project": "nlsLayer1", "url": "http://localhost:8080/assets/nlsLayer1-2"},
		{"project": "nlsLayer1", "url": "http://localhost:8080/assets/nlsLayer1-3"},
		{"project": "nlsLayer2", "url": "http://localhost:8080/assets/nlsLayer2-1"},
		{"project": "nlsLayer2", "url": "http://localhost:8080/assets/nlsLayer2-2"},
		{"project": "nlsLayer2", "url": "http://localhost:8080/assets/nlsLayer2-3"},
		{"project": "storytelling1", "url": "http://localhost:8080/assets/storytelling1-1"},
		{"project": "storytelling1", "url": "http://localhost:8080/assets/storytelling1-2"},
		{"project": "storytelling1", "url": "http://localhost:8080/assets/storytelling1-3"},
		{"project": "storytelling2", "url": "http://localhost:8080/assets/storytelling2-1"},
		{"project": "storytelling2", "url": "http://localhost:8080/assets/storytelling2-2"},
		{"project": "storytelling2", "url": "http://localhost:8080/assets/storytelling2-3"},
		{"project": "style1", "url": "http://localhost:8080/assets/style1-1"},
		{"project": "style1", "url": "http://localhost:8080/assets/style1-2"},
		{"project": "style1", "url": "http://localhost:8080/assets/style1-3"},
		{"project": "style2", "url": "http://localhost:8080/assets/style2-1"},
		{"project": "style2", "url": "http://localhost:8080/assets/style2-2"},
		{"project": "style2", "url": "http://localhost:8080/assets/style2-3"},
		{"project": "property1", "url": "http://localhost:8080/assets/property1-1"},
		{"project": "property1", "url": "http://localhost:8080/assets/property1-2"},
		{"project": "property1", "url": "http://localhost:8080/assets/property1-3"},
		{"project": "property2", "url": "http://localhost:8080/assets/property2-1"},
		{"project": "property2", "url": "http://localhost:8080/assets/property2-2"},
		{"project": "property2", "url": "http://localhost:8080/assets/property2-3"},
		{"project": "propertySchema1", "url": "http://localhost:8080/assets/propertySchema1-1"},
		{"project": "propertySchema1", "url": "http://localhost:8080/assets/propertySchema1-2"},
		{"project": "propertySchema1", "url": "http://localhost:8080/assets/propertySchema1-3"},
		{"project": "propertySchema2", "url": "http://localhost:8080/assets/propertySchema2-1"},
		{"project": "propertySchema2", "url": "http://localhost:8080/assets/propertySchema2-2"},
		{"project": "propertySchema2", "url": "http://localhost:8080/assets/propertySchema2-3"},
		{"project": "plugin1", "url": "http://localhost:8080/assets/plugin1-1"},
		{"project": "plugin1", "url": "http://localhost:8080/assets/plugin1-2"},
		{"project": "plugin1", "url": "http://localhost:8080/assets/plugin1-3"},
		{"project": "plugin2", "url": "http://localhost:8080/assets/plugin2-1"},
		{"project": "plugin2", "url": "http://localhost:8080/assets/plugin2-2"},
		{"project": "plugin2", "url": "http://localhost:8080/assets/plugin2-3"},
	}

	assert.Equal(t, expected, results, "Database content does not match expected values")
}

func setupXxxxxDB(db *mongo.Database, ctx context.Context, collectionName string) (*mongo.InsertManyResult, error) {
	return db.Collection(collectionName).InsertMany(ctx, []interface{}{
		bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    collectionName + "1",
			"scene": collectionName + "1",
			"obj": bson.M{
				"xxx": nil,
				"yyy": fmt.Sprintf("http://localhost:8080/assets/%v1-1", collectionName),
				"zzz": 1,
			},
			"arr": bson.A{
				"test",
				nil,
				fmt.Sprintf("http://localhost:8080/assets/%v1-2", collectionName),
				1,
				1.1,
				true,
				bson.M{
					"xxx": nil,
					"yyy": fmt.Sprintf("http://localhost:8080/assets/%v1-3", collectionName),
					"zzz": "test",
				},
			},
		},
		bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    collectionName + "2",
			"scene": collectionName + "2",
			"obj": map[string]any{
				"xxx": nil,
				"yyy": fmt.Sprintf("http://localhost:8080/assets/%v2-1", collectionName),
				"zzz": 1,
			},
			"arr": []any{
				"test",
				nil,
				fmt.Sprintf("http://localhost:8080/assets/%v2-2", collectionName),
				1,
				1.1,
				true,
				map[string]any{
					"xxx": nil,
					"yyy": fmt.Sprintf("http://localhost:8080/assets/%v2-3", collectionName),
					"zzz": "test",
				},
			},
		},
	})
}

func setupSceneDB(db *mongo.Database, ctx context.Context) (*mongo.InsertManyResult, error) {
	return db.Collection("scene").InsertMany(ctx, []interface{}{
		bson.M{"_id": primitive.NewObjectID(), "id": "nlsLayer1", "project": "nlsLayer1"},
		bson.M{"_id": primitive.NewObjectID(), "id": "nlsLayer2", "project": "nlsLayer2"},
		bson.M{"_id": primitive.NewObjectID(), "id": "storytelling1", "project": "storytelling1"},
		bson.M{"_id": primitive.NewObjectID(), "id": "storytelling2", "project": "storytelling2"},
		bson.M{"_id": primitive.NewObjectID(), "id": "style1", "project": "style1"},
		bson.M{"_id": primitive.NewObjectID(), "id": "style2", "project": "style2"},
		bson.M{"_id": primitive.NewObjectID(), "id": "property1", "project": "property1"},
		bson.M{"_id": primitive.NewObjectID(), "id": "property2", "project": "property2"},
		bson.M{"_id": primitive.NewObjectID(), "id": "propertySchema1", "project": "propertySchema1"},
		bson.M{"_id": primitive.NewObjectID(), "id": "propertySchema2", "project": "propertySchema2"},
		bson.M{"_id": primitive.NewObjectID(), "id": "plugin1", "project": "plugin1"},
		bson.M{"_id": primitive.NewObjectID(), "id": "plugin2", "project": "plugin2"},
		bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      "scene1",
			"project": "scene1",
			"obj": bson.M{
				"xxx": nil,
				"yyy": "http://localhost:8080/assets/scene1-1",
				"zzz": 1,
			},
			"arr": bson.A{
				"test",
				nil,
				"http://localhost:8080/assets/scene1-2",
				1,
				1.1,
				true,
				bson.M{
					"xxx": nil,
					"yyy": "http://localhost:8080/assets/scene1-3",
					"zzz": "test",
				},
			},
		},
		bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      "scene2",
			"project": "scene2",
			"obj": map[string]any{
				"xxx": nil,
				"yyy": "http://localhost:8080/assets/scene2-1",
				"zzz": 1,
			},
			"arr": []any{
				"test",
				nil,
				"http://localhost:8080/assets/scene2-2",
				1,
				1.1,
				true,
				map[string]any{
					"xxx": nil,
					"yyy": "http://localhost:8080/assets/scene2-3",
					"zzz": "test",
				},
			},
		},
	})
}

func setupAssetDB(db *mongo.Database, ctx context.Context) (*mongo.InsertManyResult, error) {
	return db.Collection("asset").InsertMany(ctx, []interface{}{
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/project1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/project1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/project1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/project2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/project2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/project2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/scene1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/scene1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/scene1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/scene2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/scene2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/scene2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/nlsLayer1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/nlsLayer1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/nlsLayer1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/nlsLayer2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/nlsLayer2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/nlsLayer2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/storytelling1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/storytelling1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/storytelling1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/storytelling2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/storytelling2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/storytelling2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/style1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/style1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/style1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/style2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/style2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/style2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/property1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/property1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/property1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/property2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/property2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/property2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/propertySchema1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/propertySchema1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/propertySchema1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/propertySchema2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/propertySchema2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/propertySchema2-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/plugin1-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/plugin1-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/plugin1-3"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/plugin2-1"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/plugin2-2"},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": "http://localhost:8080/assets/plugin2-3"},
	})
}

func setupProjectDB(db *mongo.Database, ctx context.Context) (*mongo.InsertManyResult, error) {
	return db.Collection("project").InsertMany(ctx, []interface{}{
		bson.M{
			"_id": primitive.NewObjectID(),
			"id":  "project1",
			"obj": bson.M{
				"xxx": nil,
				"yyy": "http://localhost:8080/assets/project1-1",
				"zzz": 1,
			},
			"arr": bson.A{
				"test",
				nil,
				"http://localhost:8080/assets/project1-2",
				1,
				1.1,
				true,
				bson.M{
					"xxx": nil,
					"yyy": "http://localhost:8080/assets/project1-3",
					"zzz": "test",
				},
			},
		},
		bson.M{
			"_id": primitive.NewObjectID(),
			"id":  "project2",
			"obj": map[string]any{
				"xxx": nil,
				"yyy": "http://localhost:8080/assets/project2-1",
				"zzz": 1,
			},
			"arr": []any{
				"test",
				nil,
				"http://localhost:8080/assets/project2-2",
				1,
				1.1,
				true,
				map[string]any{
					"xxx": nil,
					"yyy": "http://localhost:8080/assets/project2-3",
					"zzz": "test",
				},
			},
		},
	})
}
