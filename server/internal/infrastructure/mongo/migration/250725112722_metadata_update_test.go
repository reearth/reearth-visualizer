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

// go test -v -run TestMetadataUpdate ./internal/infrastructure/mongo/migration/...

func TestMetadataUpdate(t *testing.T) {
	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()
	projectmetadataCollection := c.WithCollection("projectmetadata").Client()
	projectCollection := c.WithCollection("project").Client()

	t.Run("success: update projectmetadata records without workspace", func(t *testing.T) {
		// Setup test data
		setupTestData2(t, ctx, db)

		// Execute migration
		err := MetadataUpdate(ctx, c)
		assert.NoError(t, err)

		// Verify results
		verifyResults(t, ctx, db)
	})

	t.Run("records with existing workspace should not be updated", func(t *testing.T) {
		// Cleanup
		if err := projectCollection.Drop(ctx); err != nil {
			t.Fatalf("failed to drop project collection: %v", err)
		}
		if err := projectmetadataCollection.Drop(ctx); err != nil {
			t.Fatalf("failed to drop projectmetadata collection: %v", err)
		}

		// Setup test data with existing workspace
		setupTestDataWithWorkspace(t, ctx, db)

		// Execute migration
		err := MetadataUpdate(ctx, c)
		assert.NoError(t, err)

		// Verify workspace was not changed
		var metadata bson.M
		err = projectmetadataCollection.FindOne(ctx, bson.M{"id": "metadata1"}).Decode(&metadata)
		require.NoError(t, err)
		assert.Equal(t, "existing_workspace", metadata["workspace"])
	})

	t.Run("error when related project does not exist", func(t *testing.T) {
		// Cleanup
		if err := projectCollection.Drop(ctx); err != nil {
			t.Fatalf("failed to drop project collection: %v", err)
		}
		if err := projectmetadataCollection.Drop(ctx); err != nil {
			t.Fatalf("failed to drop projectmetadata collection: %v", err)
		}

		// Create only projectmetadata without related project
		_, err := projectmetadataCollection.InsertOne(ctx, bson.M{
			"id":           "orphan_metadata",
			"project":      "nonexistent_project",
			"importstatus": "NONE",
		})
		require.NoError(t, err)

		// Execute migration (should return error)
		err = MetadataUpdate(ctx, c)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "migration completed with")
	})

	t.Run("error when project has no workspace field", func(t *testing.T) {
		// Cleanup
		if err := projectCollection.Drop(ctx); err != nil {
			t.Fatalf("failed to drop project collection: %v", err)
		}
		if err := projectmetadataCollection.Drop(ctx); err != nil {
			t.Fatalf("failed to drop projectmetadata collection: %v", err)
		}

		// Create project without workspace field
		_, err := projectCollection.InsertOne(ctx, bson.M{
			"id":   "project_no_workspace",
			"name": "test project",
		})
		require.NoError(t, err)

		// Create corresponding projectmetadata
		_, err = projectmetadataCollection.InsertOne(ctx, bson.M{
			"id":           "metadata_no_workspace",
			"project":      "project_no_workspace",
			"importstatus": "NONE",
		})
		require.NoError(t, err)

		// Execute migration (should return error)
		err = MetadataUpdate(ctx, c)
		assert.Error(t, err)
	})
}

func setupTestData2(t *testing.T, ctx context.Context, db *mongo.Database) {

	projects := []interface{}{
		bson.M{
			"id":        "project1",
			"workspace": "workspace1",
			"name":      "Project 1",
		},
		bson.M{
			"id":        "project2",
			"workspace": "workspace2",
			"name":      "Project 2",
		},
	}
	_, err := db.Collection("project").InsertMany(ctx, projects)
	require.NoError(t, err)
	metadatas := []interface{}{
		bson.M{
			"id":           "metadata1",
			"project":      "project1",
			"importstatus": "NONE",
		},
		bson.M{
			"id":           "metadata2",
			"project":      "project2",
			"workspace":    "",
			"importstatus": "NONE",
		},
		bson.M{
			"id":           "metadata3",
			"project":      "project1",
			"workspace":    nil,
			"importstatus": "NONE",
		},
	}
	_, err = db.Collection("projectmetadata").InsertMany(ctx, metadatas)
	require.NoError(t, err)
}

func setupTestDataWithWorkspace(t *testing.T, ctx context.Context, db *mongo.Database) {
	_, err := db.Collection("project").InsertOne(ctx, bson.M{
		"id":        "project_with_workspace",
		"workspace": "new_workspace",
		"name":      "Project with workspace",
	})
	require.NoError(t, err)
	_, err = db.Collection("projectmetadata").InsertOne(ctx, bson.M{
		"id":           "metadata1",
		"project":      "project_with_workspace",
		"workspace":    "existing_workspace",
		"importstatus": "NONE",
	})
	require.NoError(t, err)
}

func verifyResults(t *testing.T, ctx context.Context, db *mongo.Database) {
	cursor, err := db.Collection("projectmetadata").Find(ctx, bson.M{})
	require.NoError(t, err)
	defer cursor.Close(ctx)

	count := 0
	for cursor.Next(ctx) {
		var metadata bson.M
		err := cursor.Decode(&metadata)
		require.NoError(t, err)
		workspace, exists := metadata["workspace"]
		assert.True(t, exists, "workspace field should exist")
		assert.NotEmpty(t, workspace, "workspace should not be empty")
		projectID := metadata["project"].(string)
		switch projectID {
		case "project1":
			assert.Equal(t, "workspace1", workspace)
		case "project2":
			assert.Equal(t, "workspace2", workspace)
		}
		count++
	}
	assert.Equal(t, 3, count, "should have 3 metadata records")
	filter := bson.M{
		"$or": []bson.M{
			{"workspace": bson.M{"$exists": false}},
			{"workspace": nil},
			{"workspace": ""},
		},
	}
	emptyCount, err := db.Collection("projectmetadata").CountDocuments(ctx, filter)
	require.NoError(t, err)
	assert.Equal(t, int64(0), emptyCount, "should have no records with empty workspace")
}
