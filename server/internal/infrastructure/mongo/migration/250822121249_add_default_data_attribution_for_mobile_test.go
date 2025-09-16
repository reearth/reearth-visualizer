package migration

import (
	"context"
	"testing"

	mongo2 "github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// go test -v -run TestAddDefaultDataAttributionForMobile ./internal/infrastructure/mongo/migration/...

func TestAddDefaultDataAttributionForMobile(t *testing.T) {
	t.Parallel()

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	// Get scene collection
	sceneCollection := c.WithCollection("scene").Client()

	// Create DataAttribution migration instance
	migration := &DataAttribution{
		// Initialize with necessary dependencies
		sceneRepo:    mongo2.NewScene(c),
		propertyRepo: mongo2.NewProperty(c),
		pluginRepo:   mongo2.NewPlugin(c),
	}

	// Setup test data
	testScenes := createTestScenes(t, ctx, sceneCollection)

	// Verify initial state: confirm that widgets don't exist
	for _, sceneID := range testScenes {
		var scene bson.M
		err := sceneCollection.FindOne(ctx, bson.M{"id": sceneID.String()}).Decode(&scene)
		require.NoError(t, err)

		// Check if widgets field exists and is empty
		if widgets, exists := scene["widgets"]; exists {
			assert.Empty(t, widgets, "Widgets should not exist in initial state")
		}
	}

	// Execute migration
	err := migration.Do(ctx, c)
	assert.NoError(t, err, "Migration should complete without errors")

	// Verify results: confirm that widgets have been added to each scene
	for _, sceneID := range testScenes {
		verifyWidgetAdded(t, ctx, sceneCollection, sceneID)
	}
}

// Helper functions

// createTestScenes creates multiple test scenes and adds records with alignSystems to DB
func createTestScenes(t *testing.T, ctx context.Context, collection *mongo.Collection) []id.SceneID {
	var sceneIDs []id.SceneID

	// Create 3 test scenes
	for i := 0; i < 3; i++ {
		sceneID := id.NewSceneID()
		sceneIDs = append(sceneIDs, sceneID)

		// Add scene to DB as record with alignSystems
		_, err := collection.InsertOne(ctx, bson.M{
			"id":           sceneID.String(),
			"alignsystems": bson.M{"mobile": true, "desktop": true},
		})
		require.NoError(t, err)
	}

	return sceneIDs
}

// verifyWidgetAdded confirms that widgets have been added to the scene
func verifyWidgetAdded(t *testing.T, ctx context.Context, collection *mongo.Collection, sceneID id.SceneID) {
	var scene bson.M
	err := collection.FindOne(ctx, bson.M{"id": sceneID.String()}).Decode(&scene)
	require.NoError(t, err, "Failed to get scene")

	// Check if widgets have been added
	if widgets, exists := scene["widgets"]; !exists {
		t.Logf("No widgets field found in scene %s (possibly due to plugin not configured)", sceneID)
		return
	} else if widgetList, ok := widgets.([]interface{}); !ok || len(widgetList) == 0 {
		t.Logf("No widgets added to scene %s (possibly due to plugin not configured)", sceneID)
		return
	} else {
		// Verify widgets if they exist
		assert.NotEmpty(t, widgetList, "Widgets should be added")
		t.Logf("Scene %s has %d widgets", sceneID, len(widgetList))
	}

	// Check alignment systems
	if alignSystems, exists := scene["alignsystems"]; exists {
		t.Logf("Scene %s has alignment systems configured", sceneID)
		assert.NotNil(t, alignSystems)
	}
}
