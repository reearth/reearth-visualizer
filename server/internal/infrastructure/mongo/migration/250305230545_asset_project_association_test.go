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
	assetURLPrefix, err := loadAssetURLPrefix()
	assert.Nil(t, err)

	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	_, err = setupAssetDB(db, ctx, assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupProjectDB(db, ctx, assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupSceneDB(db, ctx, assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "nlsLayer", assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "storytelling", assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "style", assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "property", assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "propertySchema", assetURLPrefix)
	assert.NoError(t, err)

	_, err = setupXxxxxDB(db, ctx, "plugin", assetURLPrefix)
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
		{"project": "project1", "url": fmt.Sprintf("%sproject1-1", assetURLPrefix)},
		{"project": "project1", "url": fmt.Sprintf("%sproject1-2", assetURLPrefix)},
		{"project": "project1", "url": fmt.Sprintf("%sproject1-3", assetURLPrefix)},
		{"project": "project2", "url": fmt.Sprintf("%sproject2-1", assetURLPrefix)},
		{"project": "project2", "url": fmt.Sprintf("%sproject2-2", assetURLPrefix)},
		{"project": "project2", "url": fmt.Sprintf("%sproject2-3", assetURLPrefix)},
		{"project": "scene1", "url": fmt.Sprintf("%sscene1-1", assetURLPrefix)},
		{"project": "scene1", "url": fmt.Sprintf("%sscene1-2", assetURLPrefix)},
		{"project": "scene1", "url": fmt.Sprintf("%sscene1-3", assetURLPrefix)},
		{"project": "scene2", "url": fmt.Sprintf("%sscene2-1", assetURLPrefix)},
		{"project": "scene2", "url": fmt.Sprintf("%sscene2-2", assetURLPrefix)},
		{"project": "scene2", "url": fmt.Sprintf("%sscene2-3", assetURLPrefix)},
		{"project": "nlsLayer1", "url": fmt.Sprintf("%snlsLayer1-1", assetURLPrefix)},
		{"project": "nlsLayer1", "url": fmt.Sprintf("%snlsLayer1-2", assetURLPrefix)},
		{"project": "nlsLayer1", "url": fmt.Sprintf("%snlsLayer1-3", assetURLPrefix)},
		{"project": "nlsLayer2", "url": fmt.Sprintf("%snlsLayer2-1", assetURLPrefix)},
		{"project": "nlsLayer2", "url": fmt.Sprintf("%snlsLayer2-2", assetURLPrefix)},
		{"project": "nlsLayer2", "url": fmt.Sprintf("%snlsLayer2-3", assetURLPrefix)},
		{"project": "storytelling1", "url": fmt.Sprintf("%sstorytelling1-1", assetURLPrefix)},
		{"project": "storytelling1", "url": fmt.Sprintf("%sstorytelling1-2", assetURLPrefix)},
		{"project": "storytelling1", "url": fmt.Sprintf("%sstorytelling1-3", assetURLPrefix)},
		{"project": "storytelling2", "url": fmt.Sprintf("%sstorytelling2-1", assetURLPrefix)},
		{"project": "storytelling2", "url": fmt.Sprintf("%sstorytelling2-2", assetURLPrefix)},
		{"project": "storytelling2", "url": fmt.Sprintf("%sstorytelling2-3", assetURLPrefix)},
		{"project": "style1", "url": fmt.Sprintf("%sstyle1-1", assetURLPrefix)},
		{"project": "style1", "url": fmt.Sprintf("%sstyle1-2", assetURLPrefix)},
		{"project": "style1", "url": fmt.Sprintf("%sstyle1-3", assetURLPrefix)},
		{"project": "style2", "url": fmt.Sprintf("%sstyle2-1", assetURLPrefix)},
		{"project": "style2", "url": fmt.Sprintf("%sstyle2-2", assetURLPrefix)},
		{"project": "style2", "url": fmt.Sprintf("%sstyle2-3", assetURLPrefix)},
		{"project": "property1", "url": fmt.Sprintf("%sproperty1-1", assetURLPrefix)},
		{"project": "property1", "url": fmt.Sprintf("%sproperty1-2", assetURLPrefix)},
		{"project": "property1", "url": fmt.Sprintf("%sproperty1-3", assetURLPrefix)},
		{"project": "property2", "url": fmt.Sprintf("%sproperty2-1", assetURLPrefix)},
		{"project": "property2", "url": fmt.Sprintf("%sproperty2-2", assetURLPrefix)},
		{"project": "property2", "url": fmt.Sprintf("%sproperty2-3", assetURLPrefix)},
		{"project": "propertySchema1", "url": fmt.Sprintf("%spropertySchema1-1", assetURLPrefix)},
		{"project": "propertySchema1", "url": fmt.Sprintf("%spropertySchema1-2", assetURLPrefix)},
		{"project": "propertySchema1", "url": fmt.Sprintf("%spropertySchema1-3", assetURLPrefix)},
		{"project": "propertySchema2", "url": fmt.Sprintf("%spropertySchema2-1", assetURLPrefix)},
		{"project": "propertySchema2", "url": fmt.Sprintf("%spropertySchema2-2", assetURLPrefix)},
		{"project": "propertySchema2", "url": fmt.Sprintf("%spropertySchema2-3", assetURLPrefix)},
		{"project": "plugin1", "url": fmt.Sprintf("%splugin1-1", assetURLPrefix)},
		{"project": "plugin1", "url": fmt.Sprintf("%splugin1-2", assetURLPrefix)},
		{"project": "plugin1", "url": fmt.Sprintf("%splugin1-3", assetURLPrefix)},
		{"project": "plugin2", "url": fmt.Sprintf("%splugin2-1", assetURLPrefix)},
		{"project": "plugin2", "url": fmt.Sprintf("%splugin2-2", assetURLPrefix)},
		{"project": "plugin2", "url": fmt.Sprintf("%splugin2-3", assetURLPrefix)},
	}

	assert.Equal(t, expected, results, "Database content does not match expected values")
}

func setupXxxxxDB(db *mongo.Database, ctx context.Context, collectionName string, assetURLPrefix string) (*mongo.InsertManyResult, error) {
	return db.Collection(collectionName).InsertMany(ctx, []interface{}{
		bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    collectionName + "1",
			"scene": collectionName + "1",
			"obj": bson.M{
				"xxx": nil,
				"yyy": fmt.Sprintf("%s%v1-1", assetURLPrefix, collectionName),
				"zzz": 1,
			},
			"arr": bson.A{
				"test",
				nil,
				fmt.Sprintf("%s%v1-2", assetURLPrefix, collectionName),
				1,
				1.1,
				true,
				bson.M{
					"xxx": nil,
					"yyy": fmt.Sprintf("%s%v1-3", assetURLPrefix, collectionName),
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
				"yyy": fmt.Sprintf("%s%v2-1", assetURLPrefix, collectionName),
				"zzz": 1,
			},
			"arr": []any{
				"test",
				nil,
				fmt.Sprintf("%s%v2-2", assetURLPrefix, collectionName),
				1,
				1.1,
				true,
				map[string]any{
					"xxx": nil,
					"yyy": fmt.Sprintf("%s%v2-3", assetURLPrefix, collectionName),
					"zzz": "test",
				},
			},
		},
	})
}

func setupSceneDB(db *mongo.Database, ctx context.Context, assetURLPrefix string) (*mongo.InsertManyResult, error) {
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
				"yyy": fmt.Sprintf("%sscene1-1", assetURLPrefix),
				"zzz": 1,
			},
			"arr": bson.A{
				"test",
				nil,
				fmt.Sprintf("%sscene1-2", assetURLPrefix),
				1,
				1.1,
				true,
				bson.M{
					"xxx": nil,
					"yyy": fmt.Sprintf("%sscene1-3", assetURLPrefix),
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
				"yyy": fmt.Sprintf("%sscene2-1", assetURLPrefix),
				"zzz": 1,
			},
			"arr": []any{
				"test",
				nil,
				fmt.Sprintf("%sscene2-2", assetURLPrefix),
				1,
				1.1,
				true,
				map[string]any{
					"xxx": nil,
					"yyy": fmt.Sprintf("%sscene2-3", assetURLPrefix),
					"zzz": "test",
				},
			},
		},
	})
}

func setupAssetDB(db *mongo.Database, ctx context.Context, assetURLPrefix string) (*mongo.InsertManyResult, error) {
	return db.Collection("asset").InsertMany(ctx, []interface{}{
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproject1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproject1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproject1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproject2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproject2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproject2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sscene1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sscene1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sscene1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sscene2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sscene2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sscene2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%snlsLayer1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%snlsLayer1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%snlsLayer1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%snlsLayer2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%snlsLayer2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%snlsLayer2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstorytelling1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstorytelling1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstorytelling1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstorytelling2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstorytelling2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstorytelling2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstyle1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstyle1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstyle1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstyle2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstyle2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sstyle2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproperty1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproperty1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproperty1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproperty2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproperty2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%sproperty2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%spropertySchema1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%spropertySchema1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%spropertySchema1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%spropertySchema2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%spropertySchema2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%spropertySchema2-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%splugin1-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%splugin1-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%splugin1-3", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%splugin2-1", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%splugin2-2", assetURLPrefix)},
		bson.M{"_id": primitive.NewObjectID(), "project": nil, "url": fmt.Sprintf("%splugin2-3", assetURLPrefix)},
	})
}

func setupProjectDB(db *mongo.Database, ctx context.Context, assetURLPrefix string) (*mongo.InsertManyResult, error) {
	return db.Collection("project").InsertMany(ctx, []interface{}{
		bson.M{
			"_id": primitive.NewObjectID(),
			"id":  "project1",
			"obj": bson.M{
				"xxx": nil,
				"yyy": fmt.Sprintf("%sproject1-1", assetURLPrefix),
				"zzz": 1,
			},
			"arr": bson.A{
				"test",
				nil,
				fmt.Sprintf("%sproject1-2", assetURLPrefix),
				1,
				1.1,
				true,
				bson.M{
					"xxx": nil,
					"yyy": fmt.Sprintf("%sproject1-3", assetURLPrefix),
					"zzz": "test",
				},
			},
		},
		bson.M{
			"_id": primitive.NewObjectID(),
			"id":  "project2",
			"obj": map[string]any{
				"xxx": nil,
				"yyy": fmt.Sprintf("%sproject2-1", assetURLPrefix),
				"zzz": 1,
			},
			"arr": []any{
				"test",
				nil,
				fmt.Sprintf("%sproject2-2", assetURLPrefix),
				1,
				1.1,
				true,
				map[string]any{
					"xxx": nil,
					"yyy": fmt.Sprintf("%sproject2-3", assetURLPrefix),
					"zzz": "test",
				},
			},
		},
	})
}
