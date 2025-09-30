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

func TestAddProjectMetadataFields(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Setup: Insert test projects
	projectColl := client.WithCollection("project").Client()
	now := time.Now()
	var err error

	testProjects := []bson.M{
		{
			"id":        "project1",
			"workspace": "workspace1",
			"name":      "Test Project 1",
			"updatedat": primitive.NewDateTimeFromTime(now.Add(-24 * time.Hour)),
		},
		{
			"id":        "project2",
			"workspace": "workspace2",
			"name":      "Test Project 2",
			"updatedat": primitive.NewDateTimeFromTime(now.Add(-48 * time.Hour)),
		},
	}

	_, err = projectColl.InsertMany(ctx, []interface{}{testProjects[0], testProjects[1]})
	assert.NoError(t, err)

	// Run migration
	err = AddProjectMetadataFields(ctx, client)
	assert.NoError(t, err)

	// Verify results
	cursor, err := projectColl.Find(ctx, bson.M{})
	assert.NoError(t, err)
	defer cursor.Close(ctx)

	projects := []bson.M{}
	err = cursor.All(ctx, &projects)
	assert.NoError(t, err)
	assert.Len(t, projects, 2)

	for _, project := range projects {
		// Check that new fields were added
		assert.Contains(t, project, "created_at")
		assert.Contains(t, project, "topics")
		assert.Contains(t, project, "star_count")
		assert.Contains(t, project, "starred_by")

		// Check that updatedat field is still present (unchanged)
		assert.Contains(t, project, "updatedat")

		// Verify field types and values
		assert.IsType(t, primitive.DateTime(0), project["created_at"])
		assert.IsType(t, primitive.DateTime(0), project["updatedat"])
		assert.IsType(t, primitive.A{}, project["topics"])
		assert.IsType(t, int32(0), project["star_count"])
		assert.IsType(t, primitive.A{}, project["starred_by"])



		// Verify topics is empty array
		topics := project["topics"].(primitive.A)
		assert.Len(t, topics, 0)

		// Verify star_count is 0
		assert.Equal(t, int32(0), project["star_count"])

		// Verify starred_by is empty array
		starredBy := project["starred_by"].(primitive.A)
		assert.Len(t, starredBy, 0)
	}
}

func TestAddProjectMetadataFields_AlreadyMigrated(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Setup: Insert project that's already been migrated
	projectColl := client.WithCollection("project").Client()

	testProject := bson.M{
		"id":             "project1",
		"workspace":      "workspace1",
		"name":           "Test Project 1",
		"created_at":     primitive.NewDateTimeFromTime(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
		"topics":         []string{"existing", "topics"},
		"star_count":     5,
		"starred_by":     []string{"user1", "user2"},
	}

	_, err := projectColl.InsertOne(ctx, testProject)
	assert.NoError(t, err)

	// Run migration
	err = AddProjectMetadataFields(ctx, client)
	assert.NoError(t, err)

	// Verify the existing values weren't changed
	var result bson.M
	err = projectColl.FindOne(ctx, bson.M{"id": "project1"}).Decode(&result)
	assert.NoError(t, err)

	assert.Equal(t, primitive.NewDateTimeFromTime(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)), result["created_at"])
	assert.Equal(t, int32(5), result["star_count"])

	topics := result["topics"].(primitive.A)
	assert.Len(t, topics, 2)
	assert.Equal(t, "existing", topics[0])
	assert.Equal(t, "topics", topics[1])

	starredBy := result["starred_by"].(primitive.A)
	assert.Len(t, starredBy, 2)
	assert.Equal(t, "user1", starredBy[0])
	assert.Equal(t, "user2", starredBy[1])
}