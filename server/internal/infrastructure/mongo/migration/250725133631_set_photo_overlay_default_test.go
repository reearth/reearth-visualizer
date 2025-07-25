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

// go test -v -run TestSetPhotoOverlayDefault ./internal/infrastructure/mongo/migration/...

func TestSetPhotoOverlayDefault(t *testing.T) {
	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	collection := c.WithCollection("property").Client()

	// Setup test data
	testData := []interface{}{
		// storyPage schema (not target)
		bson.M{
			"_id":          primitive.NewObjectID(),
			"id":           "01k0y3k4f6yjhn0z3w92a13bm2",
			"scene":        "01k0y3k463c2920njgpr0bjkzs",
			"schemaplugin": "reearth",
			"schemaname":   "storyPage",
			"items":        []interface{}{},
		},
		// photo-overlay schema (empty items)
		bson.M{
			"_id":          primitive.NewObjectID(),
			"id":           "01k0y3k4akyzksqyc7mp96tfn3",
			"scene":        "01k0y3k463c2920njgpr0bjkzs",
			"schemaplugin": "reearth",
			"schemaname":   "photo-overlay",
			"items":        []interface{}{},
		},
		// photo-overlay schema (with some fields)
		bson.M{
			"_id":          primitive.NewObjectID(),
			"id":           "01k0y3mh9vmxxnppvgbt3qej2f",
			"scene":        "01k0y3k463c2920njgpr0bjkzs",
			"schemaplugin": "reearth",
			"schemaname":   "photo-overlay",
			"items": []interface{}{
				bson.M{
					"type":        "group",
					"id":          "01k0y3mha099tsqmzxngqg0qnz",
					"schemagroup": "default",
					"groups":      nil,
					"fields": []interface{}{
						bson.M{
							"field": "enabled",
							"type":  "bool",
							"value": false,
						},
						bson.M{
							"field": "cameraDuration",
							"type":  "number",
							"value": float64(1),
						},
					},
				},
			},
		},
		// photo-overlay schema (enabled field only)
		bson.M{
			"_id":          primitive.NewObjectID(),
			"id":           "01k0y3k4test1234567890abcd",
			"scene":        "01k0y3k463c2920njgpr0bjkzs",
			"schemaplugin": "reearth",
			"schemaname":   "photo-overlay",
			"items": []interface{}{
				bson.M{
					"type":        "group",
					"id":          "01k0y3mha099tsqmzxngqg0qnz",
					"schemagroup": "default",
					"groups":      nil,
					"fields": []interface{}{
						bson.M{
							"field": "enabled",
							"type":  "bool",
							"value": true,
						},
					},
				},
			},
		},
		// photo-overlay schema (cameraDuration field only)
		bson.M{
			"_id":          primitive.NewObjectID(),
			"id":           "01k0y3k4test2345678901bcde",
			"scene":        "01k0y3k463c2920njgpr0bjkzs",
			"schemaplugin": "reearth",
			"schemaname":   "photo-overlay",
			"items": []interface{}{
				bson.M{
					"type":        "group",
					"id":          "01k0y3mha099tsqmzxngqg0qnz",
					"schemagroup": "default",
					"groups":      nil,
					"fields": []interface{}{
						bson.M{
							"field": "cameraDuration",
							"type":  "number",
							"value": float64(2),
						},
					},
				},
			},
		},
	}

	// Insert test data into DB
	_, err := collection.InsertMany(ctx, testData)
	assert.NoError(t, err)

	// Execute the function
	err = SetPhotoOverlayDefault(ctx, c)
	assert.NoError(t, err)

	// Verify results
	t.Run("storyPage schema remains unchanged", func(t *testing.T) {
		var result bson.M
		err := collection.FindOne(ctx, bson.M{"id": "01k0y3k4f6yjhn0z3w92a13bm2"}).Decode(&result)
		assert.NoError(t, err)

		items, ok := result["items"].(primitive.A)
		assert.True(t, ok)
		assert.Len(t, items, 0) // items should remain empty
	})

	t.Run("photo-overlay schema with empty items gets default values", func(t *testing.T) {
		var result bson.M
		err := collection.FindOne(ctx, bson.M{"id": "01k0y3k4akyzksqyc7mp96tfn3"}).Decode(&result)
		assert.NoError(t, err)

		items, ok := result["items"].(primitive.A)
		assert.True(t, ok)

		if len(items) > 0 {
			item := items[0].(primitive.M)
			fields := item["fields"].(primitive.A)

			// Check that enabled and cameraDuration fields exist
			hasEnabled := false
			hasCameraDuration := false

			for _, field := range fields {
				f := field.(primitive.M)
				fieldName := f["field"].(string)
				if fieldName == "enabled" {
					hasEnabled = true
					assert.Equal(t, false, f["value"])
				}
				if fieldName == "cameraDuration" {
					hasCameraDuration = true
					assert.Equal(t, float64(1), f["value"])
				}
			}

			assert.True(t, hasEnabled, "enabled field should be added")
			assert.True(t, hasCameraDuration, "cameraDuration field should be added")
		}
	})

	t.Run("photo-overlay schema with both fields remains unchanged", func(t *testing.T) {
		var result bson.M
		err := collection.FindOne(ctx, bson.M{"id": "01k0y3mh9vmxxnppvgbt3qej2f"}).Decode(&result)
		assert.NoError(t, err)

		items := result["items"].(primitive.A)
		item := items[0].(primitive.M)
		fields := item["fields"].(primitive.A)

		// Verify original values are preserved
		for _, field := range fields {
			f := field.(primitive.M)
			fieldName := f["field"].(string)
			if fieldName == "enabled" {
				assert.Equal(t, false, f["value"]) // original value false
			}
			if fieldName == "cameraDuration" {
				assert.Equal(t, float64(1), f["value"]) // original value 1
			}
		}
	})

	t.Run("photo-overlay schema with enabled only gets cameraDuration added", func(t *testing.T) {
		var result bson.M
		err := collection.FindOne(ctx, bson.M{"id": "01k0y3k4test1234567890abcd"}).Decode(&result)
		assert.NoError(t, err)

		items := result["items"].(primitive.A)
		item := items[0].(primitive.M)
		fields := item["fields"].(primitive.A)

		hasEnabled := false
		hasCameraDuration := false

		for _, field := range fields {
			f := field.(primitive.M)
			fieldName := f["field"].(string)
			if fieldName == "enabled" {
				hasEnabled = true
				assert.Equal(t, true, f["value"]) // original value true
			}
			if fieldName == "cameraDuration" {
				hasCameraDuration = true
				assert.Equal(t, float64(1), f["value"]) // default value 1
			}
		}

		assert.True(t, hasEnabled, "original enabled field should be preserved")
		assert.True(t, hasCameraDuration, "cameraDuration field should be added")
	})

	t.Run("photo-overlay schema with cameraDuration only gets enabled added", func(t *testing.T) {
		var result bson.M
		err := collection.FindOne(ctx, bson.M{"id": "01k0y3k4test2345678901bcde"}).Decode(&result)
		assert.NoError(t, err)

		items := result["items"].(primitive.A)
		item := items[0].(primitive.M)
		fields := item["fields"].(primitive.A)

		hasEnabled := false
		hasCameraDuration := false

		for _, field := range fields {
			f := field.(primitive.M)
			fieldName := f["field"].(string)
			if fieldName == "enabled" {
				hasEnabled = true
				assert.Equal(t, false, f["value"]) // default value false
			}
			if fieldName == "cameraDuration" {
				hasCameraDuration = true
				assert.Equal(t, float64(2), f["value"]) // original value 2
			}
		}

		assert.True(t, hasEnabled, "enabled field should be added")
		assert.True(t, hasCameraDuration, "original cameraDuration field should be preserved")
	})

	// Verify that all photo-overlay schemas have appropriate fields
	t.Run("all photo-overlay schemas have appropriate fields", func(t *testing.T) {
		cur, err := collection.Find(ctx, bson.M{
			"schemaplugin": "reearth",
			"schemaname":   "photo-overlay",
		})
		assert.NoError(t, err)
		defer cur.Close(ctx)

		count := 0
		for cur.Next(ctx) {
			var result bson.M
			err := cur.Decode(&result)
			assert.NoError(t, err)

			items, ok := result["items"].(primitive.A)
			assert.True(t, ok)

			if len(items) > 0 {
				item := items[0].(primitive.M)
				fields := item["fields"].(primitive.A)

				hasEnabled := false
				hasCameraDuration := false

				for _, field := range fields {
					f := field.(primitive.M)
					fieldName := f["field"].(string)
					if fieldName == "enabled" {
						hasEnabled = true
					}
					if fieldName == "cameraDuration" {
						hasCameraDuration = true
					}
				}

				assert.True(t, hasEnabled, "enabled field should exist")
				assert.True(t, hasCameraDuration, "cameraDuration field should exist")
			}
			count++
		}

		assert.Equal(t, 4, count, "4 photo-overlay documents should be processed")
	})
}
