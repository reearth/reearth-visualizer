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

	// Setup: Insert test workspaces in account database
	accountClient := mongox.NewClient("reearth-account", db.Client())
	workspaceColl := accountClient.WithCollection("workspace").Client()
	
	testWorkspaces := []bson.M{
		{
			"id":   "workspace1",
			"name": "Test Workspace 1",
		},
		{
			"id":   "workspace2", 
			"name": "Test Workspace 2",
		},
	}
	
	_, err := workspaceColl.InsertMany(ctx, []interface{}{testWorkspaces[0], testWorkspaces[1]})
	assert.NoError(t, err)

	// Setup: Insert test projects
	projectColl := client.WithCollection("project").Client()
	now := time.Now()
	
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
		assert.Contains(t, project, "updated_at") 
		assert.Contains(t, project, "topics")
		assert.Contains(t, project, "workspace_name")
		assert.Contains(t, project, "star_count")
		assert.Contains(t, project, "starred_by")

		// Verify field types and values
		assert.IsType(t, primitive.DateTime(0), project["created_at"])
		assert.IsType(t, primitive.DateTime(0), project["updated_at"])
		assert.IsType(t, primitive.A{}, project["topics"])
		assert.IsType(t, "", project["workspace_name"])
		assert.IsType(t, int32(0), project["star_count"])
		assert.IsType(t, primitive.A{}, project["starred_by"])

		// Verify workspace_name is populated correctly
		switch project["workspace"] {
		case "workspace1":
			assert.Equal(t, "Test Workspace 1", project["workspace_name"])
		case "workspace2":
			assert.Equal(t, "Test Workspace 2", project["workspace_name"])
		}

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
		"created_at":     "2023-01-01T00:00:00Z",
		"updated_at":     "2023-01-02T00:00:00Z",
		"topics":         []string{"existing", "topics"},
		"workspace_name": "Existing Workspace Name",
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

	assert.Equal(t, "2023-01-01T00:00:00Z", result["created_at"])
	assert.Equal(t, "2023-01-02T00:00:00Z", result["updated_at"])
	assert.Equal(t, "Existing Workspace Name", result["workspace_name"])
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

func TestAddProjectMetadataFields_NoWorkspaceData(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)

	// Setup: Insert test project without workspace data
	projectColl := client.WithCollection("project").Client()
	
	testProject := bson.M{
		"id":        "project1",
		"workspace": "nonexistent_workspace",
		"name":      "Test Project 1",
	}
	
	_, err := projectColl.InsertOne(ctx, testProject)
	assert.NoError(t, err)

	// Run migration (without creating workspace data)
	err = AddProjectMetadataFields(ctx, client)
	assert.NoError(t, err)

	// Verify the project was updated with empty workspace_name
	var result bson.M
	err = projectColl.FindOne(ctx, bson.M{"id": "project1"}).Decode(&result)
	assert.NoError(t, err)

	assert.Equal(t, "", result["workspace_name"]) // Should be empty string when workspace not found
	assert.Equal(t, int32(0), result["star_count"])
	assert.IsType(t, primitive.A{}, result["topics"])
	assert.IsType(t, primitive.A{}, result["starred_by"])
	
	starredBy := result["starred_by"].(primitive.A)
	assert.Len(t, starredBy, 0)
}