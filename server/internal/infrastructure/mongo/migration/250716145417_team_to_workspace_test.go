package migration

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// go test -v -run TestTeamToWorkspace ./internal/infrastructure/mongo/migration/...

func TestTeamToWorkspace(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()
	sceneCollection := client.WithCollection("scene").Client()

	t.Run("successfully migrates team to workspace in both collections", func(t *testing.T) {
		// Setup: Insert test data
		projectData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project1",
				"team": "team1",
				"name": "Test Project 1",
			},
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project2",
				"team": "team2",
				"name": "Test Project 2",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project3",
				"workspace": "existing-workspace",
				"name":      "Project without team",
			},
		}

		sceneData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "scene1",
				"team": "team1",
				"name": "Test Scene 1",
			},
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "scene2",
				"team": "team3",
				"name": "Test Scene 2",
			},
		}

		_, err := projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		_, err = sceneCollection.InsertMany(ctx, sceneData)
		require.NoError(t, err)

		// Execute migration
		err = TeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify project collection
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var projects []bson.M
		err = cursor.All(ctx, &projects)
		require.NoError(t, err)

		// Check that documents with team field have been migrated
		projectsWithTeam := 0
		projectsWithWorkspace := 0
		for _, project := range projects {
			if _, hasTeam := project["team"]; hasTeam {
				projectsWithTeam++
			}
			if _, hasWorkspace := project["workspace"]; hasWorkspace {
				projectsWithWorkspace++
			}
		}

		assert.Equal(t, 0, projectsWithTeam, "No documents should have team field after migration")
		assert.Equal(t, 3, projectsWithWorkspace, "All documents should have workspace field after migration")

		// Verify specific data migration
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "team1", project1["workspace"])
		assert.Nil(t, project1["team"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "team2", project2["workspace"])
		assert.Nil(t, project2["team"])

		// Verify scene collection
		cursor, err = sceneCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var scenes []bson.M
		err = cursor.All(ctx, &scenes)
		require.NoError(t, err)

		scenesWithTeam := 0
		scenesWithWorkspace := 0
		for _, scene := range scenes {
			if _, hasTeam := scene["team"]; hasTeam {
				scenesWithTeam++
			}
			if _, hasWorkspace := scene["workspace"]; hasWorkspace {
				scenesWithWorkspace++
			}
		}

		assert.Equal(t, 0, scenesWithTeam, "No scenes should have team field after migration")
		assert.Equal(t, 2, scenesWithWorkspace, "All scenes should have workspace field after migration")

		// Verify specific scene data
		var scene1 bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "team1", scene1["workspace"])
		assert.Nil(t, scene1["team"])
	})

	t.Run("handles empty collections gracefully", func(t *testing.T) {
		// Clear collections
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)
		_, err = sceneCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Execute migration on empty collections
		err = TeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify collections are still empty
		count, err := projectCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)

		count, err = sceneCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)
	})

	t.Run("handles documents without team field", func(t *testing.T) {
		// Setup: Insert documents without team field
		projectData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project1",
				"name":      "Project without team",
				"workspace": "existing-workspace",
			},
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project2",
				"name": "Another project without team",
			},
		}

		_, err := projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Execute migration
		err = TeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify documents are unchanged
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "existing-workspace", project1["workspace"])
		assert.Nil(t, project1["team"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Nil(t, project2["workspace"])
		assert.Nil(t, project2["team"])
	})

	t.Run("handles documents with both team and workspace fields", func(t *testing.T) {
		// Clear collection
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert document with both fields
		projectData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project1",
				"team":      "team1",
				"workspace": "existing-workspace",
				"name":      "Project with both fields",
			},
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Execute migration
		err = TeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify team field is removed and workspace remains
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "team1", project1["workspace"]) // workspace should be overwritten with team value
		assert.Nil(t, project1["team"])
	})

	t.Run("handles large number of documents", func(t *testing.T) {
		// Clear collections
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)
		_, err = sceneCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert many documents
		var projectData []interface{}
		var sceneData []interface{}

		for i := 0; i < 100; i++ {
			projectData = append(projectData, bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   fmt.Sprintf("project%d", i),
				"team": fmt.Sprintf("team%d", i%10),
				"name": fmt.Sprintf("Project %d", i),
			})

			sceneData = append(sceneData, bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   fmt.Sprintf("scene%d", i),
				"team": fmt.Sprintf("team%d", i%10),
				"name": fmt.Sprintf("Scene %d", i),
			})
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		_, err = sceneCollection.InsertMany(ctx, sceneData)
		require.NoError(t, err)

		// Execute migration
		err = TeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify all documents have been migrated
		projectCount, err := projectCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(0), projectCount)

		workspaceCount, err := projectCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), workspaceCount)

		sceneCount, err := sceneCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(0), sceneCount)

		sceneWorkspaceCount, err := sceneCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), sceneWorkspaceCount)
	})
}
