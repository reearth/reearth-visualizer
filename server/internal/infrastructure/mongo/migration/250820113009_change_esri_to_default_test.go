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

// go test -v -run TestChangeEsriToDefault ./internal/infrastructure/mongo/migration/...

func TestChangeEsriToDefault(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()
	collection := client.WithCollection("property").Client()

	defer func() {
		_, _ = collection.DeleteMany(ctx, bson.M{})
	}()

	tests := []struct {
		name            string
		setupData       []bson.M
		expectedUpdates int64
		expectedError   bool
		verify          func(t *testing.T)
	}{
		{
			name: "Single document with esri_world_topo should be updated",
			setupData: []bson.M{
				createTestDocument("68a52fe741e1bd57f944890a"),
			},
			expectedUpdates: 1,
			expectedError:   false,
			verify: func(t *testing.T) {
				var result bson.M
				err := collection.FindOne(ctx, bson.M{"id": "01k32m68648m48vv08rq7q007r"}).Decode(&result)
				assert.NoError(t, err)

				items := result["items"].(bson.A)
				item := items[0].(bson.M)
				groups := item["groups"].(bson.A)
				group := groups[0].(bson.M)
				fields := group["fields"].(bson.A)
				field := fields[0].(bson.M)

				assert.Equal(t, "tile_type", field["field"])
				assert.Equal(t, "default", field["value"])
			},
		},
		{
			name: "Multiple documents with esri_world_topo should be updated",
			setupData: []bson.M{
				createTestDocument("68a52fe741e1bd57f944890b"),
				createDocumentWithMultipleEsri("68a52fe741e1bd57f944890c"),
			},
			expectedUpdates: 2,
			expectedError:   false,
			verify: func(t *testing.T) {
				cursor, err := collection.Find(ctx, bson.M{})
				assert.NoError(t, err)
				defer cursor.Close(ctx)

				esriCount := 0
				defaultCount := 0

				for cursor.Next(ctx) {
					var doc bson.M
					err := cursor.Decode(&doc)
					assert.NoError(t, err)

					countValuesInDocument(doc, &esriCount, &defaultCount)
				}

				assert.Equal(t, 0, esriCount, "No esri_world_topo should remain")
				assert.Greater(t, defaultCount, 0, "Should have default values")
			},
		},
		{
			name: "Document without esri_world_topo should remain unchanged",
			setupData: []bson.M{
				createDocumentWithoutEsri("68a52fe741e1bd57f944890d"),
			},
			expectedUpdates: 0,
			expectedError:   false,
			verify: func(t *testing.T) {
				var result bson.M
				err := collection.FindOne(ctx, bson.M{"id": "test-no-esri"}).Decode(&result)
				assert.NoError(t, err)

				items := result["items"].(bson.A)
				item := items[0].(bson.M)
				groups := item["groups"].(bson.A)
				group := groups[0].(bson.M)
				fields := group["fields"].(bson.A)
				field := fields[0].(bson.M)

				assert.Equal(t, "tile_type", field["field"])
				assert.Equal(t, "open_street_map", field["value"])
			},
		},
		{
			name: "Mixed document types should only update esri_world_topo",
			setupData: []bson.M{
				createTestDocument("68a52fe741e1bd57f944890e"),
				createDocumentWithoutEsri("68a52fe741e1bd57f944890f"),
				createDocumentWithMultipleEsri("68a52fe741e1bd57f9448910"),
			},
			expectedUpdates: 2,
			expectedError:   false,
			verify: func(t *testing.T) {
				cursor, err := collection.Find(ctx, bson.M{
					"items.groups.fields": bson.M{
						"$elemMatch": bson.M{
							"field": "tile_type",
							"value": "esri_world_topo",
						},
					},
				})
				assert.NoError(t, err)
				defer cursor.Close(ctx)

				count := 0
				for cursor.Next(ctx) {
					count++
				}
				assert.Equal(t, 0, count, "No documents should have esri_world_topo after migration")

				var osmDoc bson.M
				err = collection.FindOne(ctx, bson.M{"id": "test-no-esri"}).Decode(&osmDoc)
				assert.NoError(t, err)

				items := osmDoc["items"].(bson.A)
				item := items[0].(bson.M)
				groups := item["groups"].(bson.A)
				group := groups[0].(bson.M)
				fields := group["fields"].(bson.A)
				field := fields[0].(bson.M)

				assert.Equal(t, "open_street_map", field["value"])
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, _ = collection.DeleteMany(ctx, bson.M{})
			if len(tt.setupData) > 0 {
				docs := make([]interface{}, len(tt.setupData))
				for i, doc := range tt.setupData {
					docs[i] = doc
				}
				_, err := collection.InsertMany(ctx, docs)
				assert.NoError(t, err)
			}

			err := ChangeEsriToDefault(ctx, client)

			if tt.expectedError {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)

			if tt.verify != nil {
				tt.verify(t)
			}
		})
	}
}

func createTestDocument(objectIdHex string) bson.M {
	objId, _ := primitive.ObjectIDFromHex(objectIdHex)
	return bson.M{
		"_id":          objId,
		"id":           "01k32m68648m48vv08rq7q007r",
		"scene":        "01k32m686309y999aeer53x5y3",
		"schemaplugin": "reearth",
		"schemaname":   "cesium-beta",
		"items": bson.A{
			bson.M{
				"type":        "grouplist",
				"id":          "01k32mq1c5e9tb607evn4qhw67",
				"schemagroup": "tiles",
				"groups": bson.A{
					bson.M{
						"type":        "group",
						"id":          "01k32mq1c5e9tb607evrehcy85",
						"schemagroup": "tiles",
						"groups":      nil,
						"fields": bson.A{
							bson.M{
								"field": "tile_type",
								"type":  "string",
								"value": "esri_world_topo",
							},
						},
					},
					bson.M{
						"type":        "group",
						"id":          "01k32n22k8s11vp5bvj28e9hz9",
						"schemagroup": "tiles",
						"groups":      nil,
						"fields": bson.A{
							bson.M{
								"field": "tile_type",
								"type":  "string",
								"value": "open_street_map",
							},
						},
					},
				},
				"fields": nil,
			},
		},
	}
}

func createDocumentWithMultipleEsri(objectIdHex string) bson.M {
	objId, _ := primitive.ObjectIDFromHex(objectIdHex)
	return bson.M{
		"_id": objId,
		"id":  "test-multiple",
		"items": bson.A{
			bson.M{
				"type": "grouplist",
				"groups": bson.A{
					bson.M{
						"type": "group",
						"fields": bson.A{
							bson.M{
								"field": "tile_type",
								"type":  "string",
								"value": "esri_world_topo",
							},
						},
					},
					bson.M{
						"type": "group",
						"fields": bson.A{
							bson.M{
								"field": "tile_type",
								"type":  "string",
								"value": "esri_world_topo",
							},
						},
					},
				},
			},
		},
	}
}

func createDocumentWithoutEsri(objectIdHex string) bson.M {
	objId, _ := primitive.ObjectIDFromHex(objectIdHex)
	return bson.M{
		"_id": objId,
		"id":  "test-no-esri",
		"items": bson.A{
			bson.M{
				"type": "grouplist",
				"groups": bson.A{
					bson.M{
						"type": "group",
						"fields": bson.A{
							bson.M{
								"field": "tile_type",
								"type":  "string",
								"value": "open_street_map",
							},
						},
					},
				},
			},
		},
	}
}

func countValuesInDocument(doc bson.M, esriCount, defaultCount *int) {
	if items, ok := doc["items"].(bson.A); ok {
		for _, item := range items {
			if itemMap, ok := item.(bson.M); ok {
				if groups, ok := itemMap["groups"].(bson.A); ok {
					for _, group := range groups {
						if groupMap, ok := group.(bson.M); ok {
							if fields, ok := groupMap["fields"].(bson.A); ok {
								for _, field := range fields {
									if fieldMap, ok := field.(bson.M); ok {
										if fieldMap["field"] == "tile_type" {
											switch fieldMap["value"] {
											case "esri_world_topo":
												*esriCount++
											case "default":
												*defaultCount++
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
