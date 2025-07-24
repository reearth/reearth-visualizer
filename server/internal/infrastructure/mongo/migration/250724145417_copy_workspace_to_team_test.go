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

// go test -v -run TestCopyWorkspaceToTeam ./internal/infrastructure/mongo/migration/...

func TestCopyWorkspaceToTeam(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()
	sceneCollection := client.WithCollection("scene").Client()
	assetCollection := client.WithCollection("asset").Client()

	t.Run("successfully copies workspace to team in all collections", func(t *testing.T) {
		// Setup: Insert test data with workspace but no team
		projectData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project1",
				"workspace": "workspace1",
				"name":      "Test Project 1",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project2",
				"workspace": "workspace2",
				"name":      "Test Project 2",
			},
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project3",
				"team": "existing-team",
				"name": "Project with existing team",
			},
		}

		sceneData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "scene1",
				"workspace": "workspace1",
				"name":      "Test Scene 1",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "scene2",
				"workspace": "workspace3",
				"name":      "Test Scene 2",
			},
		}

		assetData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "asset1",
				"workspace": "workspace1",
				"name":      "Test Asset 1",
			},
		}

		_, err := projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		_, err = sceneCollection.InsertMany(ctx, sceneData)
		require.NoError(t, err)

		_, err = assetCollection.InsertMany(ctx, assetData)
		require.NoError(t, err)

		// Execute migration
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify project collection
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var projects []bson.M
		err = cursor.All(ctx, &projects)
		require.NoError(t, err)

		// Check that documents with workspace field now have team field
		projectsWithWorkspace := 0
		projectsWithTeam := 0
		for _, project := range projects {
			if _, hasWorkspace := project["workspace"]; hasWorkspace {
				projectsWithWorkspace++
			}
			if _, hasTeam := project["team"]; hasTeam {
				projectsWithTeam++
			}
		}

		assert.Equal(t, 2, projectsWithWorkspace, "Projects with workspace should still have workspace field")
		assert.Equal(t, 3, projectsWithTeam, "All projects should now have team field")

		// Verify specific data migration
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "workspace1", project1["workspace"])
		assert.Equal(t, "workspace1", project1["team"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "workspace2", project2["workspace"])
		assert.Equal(t, "workspace2", project2["team"])

		// Verify project with existing team is unchanged
		var project3 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project3"}).Decode(&project3)
		require.NoError(t, err)
		assert.Equal(t, "existing-team", project3["team"])
		assert.Nil(t, project3["workspace"])

		// Verify scene collection
		cursor, err = sceneCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var scenes []bson.M
		err = cursor.All(ctx, &scenes)
		require.NoError(t, err)

		scenesWithWorkspace := 0
		scenesWithTeam := 0
		for _, scene := range scenes {
			if _, hasWorkspace := scene["workspace"]; hasWorkspace {
				scenesWithWorkspace++
			}
			if _, hasTeam := scene["team"]; hasTeam {
				scenesWithTeam++
			}
		}

		assert.Equal(t, 2, scenesWithWorkspace, "Scenes with workspace should still have workspace field")
		assert.Equal(t, 2, scenesWithTeam, "All scenes should now have team field")

		// Verify specific scene data
		var scene1 bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "workspace1", scene1["workspace"])
		assert.Equal(t, "workspace1", scene1["team"])

		// Verify asset collection
		cursor, err = assetCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var assets []bson.M
		err = cursor.All(ctx, &assets)
		require.NoError(t, err)

		assetsWithWorkspace := 0
		assetsWithTeam := 0
		for _, asset := range assets {
			if _, hasWorkspace := asset["workspace"]; hasWorkspace {
				assetsWithWorkspace++
			}
			if _, hasTeam := asset["team"]; hasTeam {
				assetsWithTeam++
			}
		}

		assert.Equal(t, 1, assetsWithWorkspace, "Asset with workspace should still have workspace field")
		assert.Equal(t, 1, assetsWithTeam, "Asset should now have team field")

		// Verify specific asset data
		var asset1 bson.M
		err = assetCollection.FindOne(ctx, bson.M{"id": "asset1"}).Decode(&asset1)
		require.NoError(t, err)
		assert.Equal(t, "workspace1", asset1["workspace"])
		assert.Equal(t, "workspace1", asset1["team"])
	})

	t.Run("handles empty collections gracefully", func(t *testing.T) {
		// Clear collections
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)
		_, err = sceneCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)
		_, err = assetCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Execute migration on empty collections
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify collections are still empty
		count, err := projectCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)

		count, err = sceneCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)

		count, err = assetCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(0), count)
	})

	t.Run("handles documents without workspace field", func(t *testing.T) {
		// Setup: Insert documents without workspace field
		projectData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project1",
				"name": "Project without workspace",
			},
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project2",
				"team": "existing-team",
				"name": "Project with existing team only",
			},
		}

		_, err := projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Execute migration
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify documents are unchanged
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Nil(t, project1["workspace"])
		assert.Nil(t, project1["team"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Nil(t, project2["workspace"])
		assert.Equal(t, "existing-team", project2["team"])
	})

	t.Run("handles documents with both workspace and team fields", func(t *testing.T) {
		// Clear collection
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert document with both fields
		projectData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project1",
				"workspace": "workspace1",
				"team":      "existing-team",
				"name":      "Project with both fields",
			},
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Execute migration
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify workspace field remains and team field is unchanged (should not be updated)
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "workspace1", project1["workspace"])
		assert.Equal(t, "existing-team", project1["team"]) // team should remain unchanged
	})

	t.Run("handles large number of documents", func(t *testing.T) {
		// Clear collections
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)
		_, err = sceneCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)
		_, err = assetCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert many documents
		var projectData []interface{}
		var sceneData []interface{}
		var assetData []interface{}

		for i := 0; i < 100; i++ {
			projectData = append(projectData, bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        fmt.Sprintf("project%d", i),
				"workspace": fmt.Sprintf("workspace%d", i%10),
				"name":      fmt.Sprintf("Project %d", i),
			})

			sceneData = append(sceneData, bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        fmt.Sprintf("scene%d", i),
				"workspace": fmt.Sprintf("workspace%d", i%10),
				"name":      fmt.Sprintf("Scene %d", i),
			})

			assetData = append(assetData, bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        fmt.Sprintf("asset%d", i),
				"workspace": fmt.Sprintf("workspace%d", i%10),
				"name":      fmt.Sprintf("Asset %d", i),
			})
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		_, err = sceneCollection.InsertMany(ctx, sceneData)
		require.NoError(t, err)

		_, err = assetCollection.InsertMany(ctx, assetData)
		require.NoError(t, err)

		// Execute migration
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify all documents have been migrated
		workspaceCount, err := projectCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), workspaceCount)

		teamCount, err := projectCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), teamCount)

		sceneWorkspaceCount, err := sceneCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), sceneWorkspaceCount)

		sceneTeamCount, err := sceneCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), sceneTeamCount)

		assetWorkspaceCount, err := assetCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), assetWorkspaceCount)

		assetTeamCount, err := assetCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), assetTeamCount)
	})

	t.Run("idempotent - running migration twice has no additional effect", func(t *testing.T) {
		// Clear collections
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert test data
		projectData := []interface{}{
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project1",
				"workspace": "workspace1",
				"name":      "Test Project 1",
			},
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Run migration first time
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify team field was added
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "workspace1", project1["workspace"])
		assert.Equal(t, "workspace1", project1["team"])

		// Run migration second time
		err = CopyWorkspaceToTeam(ctx, client)
		require.NoError(t, err)

		// Verify no changes occurred
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "workspace1", project1["workspace"])
		assert.Equal(t, "workspace1", project1["team"])

		// Verify only one document exists
		count, err := projectCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(1), count)
	})
}
