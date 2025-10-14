package migration

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestUpdateProjectMetadataFields_WithExistingMetadata(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Setup: Insert test projects
	projectColl := client.WithCollection("project").Client()
	metadataColl := client.WithCollection("projectmetadata").Client()
	now := time.Now()
	var err error

	testProjects := []bson.M{
		{
			"id":         "project1",
			"workspace":  "workspace1",
			"name":       "Test Project 1",
			"updatedat":  primitive.NewDateTimeFromTime(now.Add(-24 * time.Hour)),
			"topics":     []string{"old", "topics"},
			"star_count": 5,
			"starred_by": []string{"user1"},
			"created_at": primitive.NewDateTimeFromTime(now),
		},
		{
			"id":        "project2",
			"workspace": "workspace2",
			"name":      "Test Project 2",
			"updatedat": primitive.NewDateTimeFromTime(now.Add(-48 * time.Hour)),
		},
	}

	// Setup: Insert existing projectmetadata for project1 only
	existingMetadata := bson.M{
		"project":    "project1",
		"topics":     []string{"existing", "topics"},
		"star_count": 10,
		"starred_by": []string{"user1", "user2"},
	}

	_, err = projectColl.InsertMany(ctx, []interface{}{testProjects[0], testProjects[1]})
	assert.NoError(t, err)
	_, err = metadataColl.InsertOne(ctx, existingMetadata)
	assert.NoError(t, err)

	// Run migration
	err = UpdateProjectMetadataFields(ctx, client)
	assert.NoError(t, err)

	// Verify projects have unwanted fields removed
	cursor, err := projectColl.Find(ctx, bson.M{})
	assert.NoError(t, err)
	defer cursor.Close(ctx)

	projects := []bson.M{}
	err = cursor.All(ctx, &projects)
	assert.NoError(t, err)
	assert.Len(t, projects, 2)

	for _, project := range projects {
		// Check that unwanted fields were removed from projects
		assert.NotContains(t, project, "topics")
		assert.NotContains(t, project, "star_count")
		assert.NotContains(t, project, "starred_by")
		assert.NotContains(t, project, "created_at")

		// Check that other fields are still present
		assert.Contains(t, project, "updatedat")
		assert.Contains(t, project, "id")
		assert.Contains(t, project, "workspace")
		assert.Contains(t, project, "name")
	}

	// Verify projectmetadata was updated for project1 (existing metadata)
	var updatedMetadata bson.M
	err = metadataColl.FindOne(ctx, bson.M{"project": "project1"}).Decode(&updatedMetadata)
	assert.NoError(t, err)

	// Check that metadata fields were reset to defaults
	assert.Equal(t, []interface{}{}, updatedMetadata["topics"].(primitive.A))
	assert.Equal(t, int32(0), updatedMetadata["star_count"])
	assert.Equal(t, []interface{}{}, updatedMetadata["starred_by"].(primitive.A))

	// Verify no metadata was created for project2 (no existing metadata)
	var noMetadata bson.M
	err = metadataColl.FindOne(ctx, bson.M{"project": "project2"}).Decode(&noMetadata)
	assert.Error(t, err) // Should not find any record
}

func TestUpdateProjectMetadataFields_NoExistingMetadata(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Setup: Insert project with unwanted fields but no existing projectmetadata
	projectColl := client.WithCollection("project").Client()
	metadataColl := client.WithCollection("projectmetadata").Client()

	testProject := bson.M{
		"id":         "project1",
		"workspace":  "workspace1",
		"name":       "Test Project 1",
		"created_at": primitive.NewDateTimeFromTime(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
		"topics":     []string{"unwanted", "topics"},
		"star_count": 5,
		"starred_by": []string{"user1", "user2"},
	}

	_, err := projectColl.InsertOne(ctx, testProject)
	assert.NoError(t, err)

	// Run migration
	err = UpdateProjectMetadataFields(ctx, client)
	assert.NoError(t, err)

	// Verify the unwanted fields were removed from project
	var result bson.M
	err = projectColl.FindOne(ctx, bson.M{"id": "project1"}).Decode(&result)
	assert.NoError(t, err)

	// Check that unwanted fields were removed
	assert.NotContains(t, result, "created_at")
	assert.NotContains(t, result, "topics")
	assert.NotContains(t, result, "star_count")
	assert.NotContains(t, result, "starred_by")

	// Check that other fields are still present
	assert.Contains(t, result, "id")
	assert.Contains(t, result, "workspace")
	assert.Contains(t, result, "name")

	// Verify no metadata was created (since none existed before)
	var noMetadata bson.M
	err = metadataColl.FindOne(ctx, bson.M{"project": "project1"}).Decode(&noMetadata)
	assert.Error(t, err) // Should not find any record
}
