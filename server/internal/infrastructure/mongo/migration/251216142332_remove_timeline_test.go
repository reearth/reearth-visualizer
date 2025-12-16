package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// go test -v -run TestRemoveTimeline ./internal/infrastructure/mongo/migration/...

func TestRemoveTimeline(t *testing.T) {
	t.Parallel()

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	// Setup test data
	setupTimelineTestData(t, ctx, db)

	// Verify initial state
	propertyCount, err := db.Collection("property").CountDocuments(ctx, bson.M{"schemaname": "timeline"})
	require.NoError(t, err)
	assert.Equal(t, int64(2), propertyCount, "Should have 2 timeline properties initially")

	// Verify scene has timeline widget
	var scene bson.M
	err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene)
	require.NoError(t, err)

	widgets := scene["widgets"].(bson.A)
	assert.Len(t, widgets, 3, "Should have 3 widgets initially")

	// Verify alignsystems has timeline widget ID
	alignsystems := scene["alignsystems"].(bson.M)
	desktop := alignsystems["desktop"].(bson.M)
	outer := desktop["outer"].(bson.M)
	center := outer["center"].(bson.M)
	bottom := center["bottom"].(bson.M)
	widgetids := bottom["widgetids"].(bson.A)
	assert.Len(t, widgetids, 1, "Should have 1 widget in alignsystems initially")
	assert.Equal(t, "timeline_widget_1", widgetids[0], "Should contain timeline widget ID")

	// Execute migration
	err = RemoveTimeline(ctx, c)
	assert.NoError(t, err, "Migration should complete without errors")

	// Verify timeline properties are deleted
	propertyCount, err = db.Collection("property").CountDocuments(ctx, bson.M{"schemaname": "timeline"})
	require.NoError(t, err)
	assert.Equal(t, int64(0), propertyCount, "Should have 0 timeline properties after migration")

	// Verify other properties still exist
	otherPropertyCount, err := db.Collection("property").CountDocuments(ctx, bson.M{"schemaname": "navigator"})
	require.NoError(t, err)
	assert.Equal(t, int64(1), otherPropertyCount, "Other properties should not be affected")

	// Verify timeline widget is removed from scene
	err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene)
	require.NoError(t, err)

	widgets = scene["widgets"].(bson.A)
	assert.Len(t, widgets, 2, "Should have 2 widgets after migration")

	// Verify no timeline widget exists
	for _, w := range widgets {
		widget := w.(bson.M)
		assert.NotEqual(t, "timeline", widget["extension"], "Timeline widget should be removed")
	}

	// Verify timeline widget ID is removed from alignsystems
	alignsystems = scene["alignsystems"].(bson.M)
	desktop = alignsystems["desktop"].(bson.M)
	outer = desktop["outer"].(bson.M)
	center = outer["center"].(bson.M)
	bottom = center["bottom"].(bson.M)
	if widgetidsVal := bottom["widgetids"]; widgetidsVal != nil {
		widgetids = widgetidsVal.(bson.A)
		assert.Len(t, widgetids, 0, "Timeline widget ID should be removed from alignsystems")
	} else {
		// widgetids could be nil or empty, both are acceptable
		t.Log("widgetids is nil, which is acceptable after timeline removal")
	}
}

func TestDeleteTimelineProperties(t *testing.T) {
	t.Parallel()

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	// Insert test properties
	_, err := db.Collection("property").InsertMany(ctx, []interface{}{
		bson.M{
			"id":           "prop1",
			"scene":        "scene1",
			"schemaplugin": "reearth",
			"schemaname":   "timeline",
		},
		bson.M{
			"id":           "prop2",
			"scene":        "scene1",
			"schemaplugin": "reearth",
			"schemaname":   "navigator",
		},
		bson.M{
			"id":           "prop3",
			"scene":        "scene2",
			"schemaplugin": "reearth",
			"schemaname":   "timeline",
		},
	})
	require.NoError(t, err)

	// Execute deletion
	err = deleteTimelineProperties(ctx, c)
	assert.NoError(t, err)

	// Verify timeline properties are deleted
	count, err := db.Collection("property").CountDocuments(ctx, bson.M{"schemaname": "timeline"})
	require.NoError(t, err)
	assert.Equal(t, int64(0), count, "All timeline properties should be deleted")

	// Verify other properties still exist
	count, err = db.Collection("property").CountDocuments(ctx, bson.M{"schemaname": "navigator"})
	require.NoError(t, err)
	assert.Equal(t, int64(1), count, "Other properties should remain")
}

func TestRemoveTimelineWidgetsFromScenes(t *testing.T) {
	t.Parallel()

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	// Insert test scene
	_, err := db.Collection("scene").InsertOne(ctx, bson.M{
		"id": "scene1",
		"widgets": bson.A{
			bson.M{
				"id":        "widget1",
				"plugin":    "reearth",
				"extension": "navigator",
				"property":  "prop1",
			},
			bson.M{
				"id":        "widget2",
				"plugin":    "reearth",
				"extension": "timeline",
				"property":  "prop2",
			},
		},
		"alignsystems": bson.M{
			"desktop": bson.M{
				"outer": bson.M{
					"center": bson.M{
						"bottom": bson.M{
							"widgetids": bson.A{"widget2"},
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)

	// Execute removal
	err = removeTimelineWidgetsFromScenes(ctx, c)
	assert.NoError(t, err)

	// Verify scene is updated
	var scene bson.M
	err = db.Collection("scene").FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene)
	require.NoError(t, err)

	widgets := scene["widgets"].(bson.A)
	assert.Len(t, widgets, 1, "Should have 1 widget after removal")

	widget := widgets[0].(bson.M)
	assert.Equal(t, "navigator", widget["extension"], "Remaining widget should be navigator")

	// Verify alignsystems is updated
	alignsystems := scene["alignsystems"].(bson.M)
	desktop := alignsystems["desktop"].(bson.M)
	outer := desktop["outer"].(bson.M)
	center := outer["center"].(bson.M)
	bottom := center["bottom"].(bson.M)
	if widgetidsVal := bottom["widgetids"]; widgetidsVal != nil {
		widgetids := widgetidsVal.(bson.A)
		assert.Len(t, widgetids, 0, "Widget IDs should be removed from alignsystems")
	} else {
		// widgetids could be nil or empty, both are acceptable
		t.Log("widgetids is nil, which is acceptable")
	}
}

func TestRemoveWidgetIDsFromAlignSystems(t *testing.T) {
	alignsystems := bson.M{
		"desktop": bson.M{
			"inner": bson.M{
				"left": bson.M{
					"top": bson.M{
						"widgetids": bson.A{"widget1", "widget2"},
					},
				},
			},
			"outer": bson.M{
				"center": bson.M{
					"bottom": bson.M{
						"widgetids": bson.A{"widget2", "widget3"},
					},
				},
			},
		},
		"mobile": bson.M{
			"outer": bson.M{
				"left": bson.M{
					"bottom": bson.M{
						"widgetids": bson.A{"widget4"},
					},
				},
			},
		},
	}

	widgetIDsToRemove := []string{"widget2", "widget4"}

	result := removeWidgetIDsFromAlignSystems(alignsystems, widgetIDsToRemove)

	// Verify desktop.inner.left.top
	desktop := result["desktop"].(bson.M)
	inner := desktop["inner"].(bson.M)
	left := inner["left"].(bson.M)
	top := left["top"].(bson.M)
	widgetids := top["widgetids"].(bson.A)
	assert.Len(t, widgetids, 1, "Should have 1 widget ID after removal")
	assert.Equal(t, "widget1", widgetids[0], "Should keep widget1")

	// Verify desktop.outer.center.bottom
	outer := desktop["outer"].(bson.M)
	center := outer["center"].(bson.M)
	bottom := center["bottom"].(bson.M)
	widgetids = bottom["widgetids"].(bson.A)
	assert.Len(t, widgetids, 1, "Should have 1 widget ID after removal")
	assert.Equal(t, "widget3", widgetids[0], "Should keep widget3")

	// Verify mobile.outer.left.bottom
	mobile := result["mobile"].(bson.M)
	outer = mobile["outer"].(bson.M)
	left = outer["left"].(bson.M)
	bottom = left["bottom"].(bson.M)
	widgetids = bottom["widgetids"].(bson.A)
	assert.Len(t, widgetids, 0, "Should have 0 widget IDs after removal")
}

// Helper function to setup test data
func setupTimelineTestData(t *testing.T, ctx context.Context, db *mongo.Database) {
	// Insert timeline properties
	_, err := db.Collection("property").InsertMany(ctx, []interface{}{
		bson.M{
			"id":           "timeline_prop_1",
			"scene":        "scene1",
			"schemaplugin": "reearth",
			"schemaname":   "timeline",
			"items":        bson.A{},
		},
		bson.M{
			"id":           "timeline_prop_2",
			"scene":        "scene2",
			"schemaplugin": "reearth",
			"schemaname":   "timeline",
			"items":        bson.A{},
		},
		bson.M{
			"id":           "navigator_prop_1",
			"scene":        "scene1",
			"schemaplugin": "reearth",
			"schemaname":   "navigator",
			"items":        bson.A{},
		},
	})
	require.NoError(t, err)

	// Insert scene with timeline widget
	_, err = db.Collection("scene").InsertOne(ctx, bson.M{
		"id":        "scene1",
		"project":   "project1",
		"workspace": "workspace1",
		"widgets": bson.A{
			bson.M{
				"id":        "navigator_widget_1",
				"plugin":    "reearth",
				"extension": "navigator",
				"property":  "navigator_prop_1",
				"enabled":   true,
				"extended":  false,
			},
			bson.M{
				"id":        "timeline_widget_1",
				"plugin":    "reearth",
				"extension": "timeline",
				"property":  "timeline_prop_1",
				"enabled":   false,
				"extended":  true,
			},
			bson.M{
				"id":        "storytelling_widget_1",
				"plugin":    "reearth",
				"extension": "storytelling",
				"property":  "storytelling_prop_1",
				"enabled":   true,
				"extended":  false,
			},
		},
		"alignsystems": bson.M{
			"desktop": bson.M{
				"inner": bson.M{
					"left": bson.M{
						"top": bson.M{
							"widgetids":  bson.A{},
							"align":      "start",
							"padding":    nil,
							"gap":        nil,
							"centered":   false,
							"background": nil,
						},
					},
				},
				"outer": bson.M{
					"center": bson.M{
						"bottom": bson.M{
							"widgetids":  bson.A{"timeline_widget_1"},
							"align":      "start",
							"padding":    nil,
							"gap":        nil,
							"centered":   false,
							"background": nil,
						},
					},
				},
			},
			"mobile": bson.M{
				"outer": bson.M{
					"left": bson.M{
						"bottom": bson.M{
							"widgetids":  bson.A{},
							"align":      "start",
							"padding":    nil,
							"gap":        nil,
							"centered":   false,
							"background": nil,
						},
					},
				},
			},
		},
	})
	require.NoError(t, err)
}
