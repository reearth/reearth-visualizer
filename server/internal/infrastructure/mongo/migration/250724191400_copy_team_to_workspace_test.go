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

// go test -v -run TestCopyTeamToWorkspace ./internal/infrastructure/mongo/migration/...

func TestCopyTeamToWorkspace(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	projectCollection := client.WithCollection("project").Client()
	sceneCollection := client.WithCollection("scene").Client()
	assetCollection := client.WithCollection("asset").Client()

	t.Run("successfully copies team to workspace in all collections", func(t *testing.T) {
		// Setup: Insert test data with team but no workspace
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
				"name":      "Project with existing workspace",
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

		assetData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "asset1",
				"team": "team1",
				"name": "Test Asset 1",
			},
		}

		_, err := projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		_, err = sceneCollection.InsertMany(ctx, sceneData)
		require.NoError(t, err)

		_, err = assetCollection.InsertMany(ctx, assetData)
		require.NoError(t, err)

		// Execute migration
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify project collection
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var projects []bson.M
		err = cursor.All(ctx, &projects)
		require.NoError(t, err)

		// Check that documents with team field now have workspace field
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

		assert.Equal(t, 2, projectsWithTeam, "Projects with team should still have team field")
		assert.Equal(t, 3, projectsWithWorkspace, "All projects should now have workspace field")

		// Verify specific data migration
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "team1", project1["team"])
		assert.Equal(t, "team1", project1["workspace"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "team2", project2["team"])
		assert.Equal(t, "team2", project2["workspace"])

		// Verify project with existing workspace is unchanged
		var project3 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project3"}).Decode(&project3)
		require.NoError(t, err)
		assert.Equal(t, "existing-workspace", project3["workspace"])
		assert.Nil(t, project3["team"])

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

		assert.Equal(t, 2, scenesWithTeam, "Scenes with team should still have team field")
		assert.Equal(t, 2, scenesWithWorkspace, "All scenes should now have workspace field")

		// Verify specific scene data
		var scene1 bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": "scene1"}).Decode(&scene1)
		require.NoError(t, err)
		assert.Equal(t, "team1", scene1["team"])
		assert.Equal(t, "team1", scene1["workspace"])

		// Verify asset collection
		cursor, err = assetCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		var assets []bson.M
		err = cursor.All(ctx, &assets)
		require.NoError(t, err)

		assetsWithTeam := 0
		assetsWithWorkspace := 0
		for _, asset := range assets {
			if _, hasTeam := asset["team"]; hasTeam {
				assetsWithTeam++
			}
			if _, hasWorkspace := asset["workspace"]; hasWorkspace {
				assetsWithWorkspace++
			}
		}

		assert.Equal(t, 1, assetsWithTeam, "Asset with team should still have team field")
		assert.Equal(t, 1, assetsWithWorkspace, "Asset should now have workspace field")

		// Verify specific asset data
		var asset1 bson.M
		err = assetCollection.FindOne(ctx, bson.M{"id": "asset1"}).Decode(&asset1)
		require.NoError(t, err)
		assert.Equal(t, "team1", asset1["team"])
		assert.Equal(t, "team1", asset1["workspace"])
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
		err = CopyTeamToWorkspace(ctx, client)
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

	t.Run("handles documents without team field", func(t *testing.T) {
		// Setup: Insert documents without team field
		projectData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project1",
				"name": "Project without team",
			},
			bson.M{
				"_id":       primitive.NewObjectID(),
				"id":        "project2",
				"workspace": "existing-workspace",
				"name":      "Project with existing workspace only",
			},
		}

		_, err := projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Execute migration
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify documents are unchanged
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Nil(t, project1["team"])
		assert.Nil(t, project1["workspace"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Nil(t, project2["team"])
		assert.Equal(t, "existing-workspace", project2["workspace"])
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
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify team field remains and workspace field is unchanged (should not be updated)
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "team1", project1["team"])
		assert.Equal(t, "existing-workspace", project1["workspace"]) // workspace should remain unchanged
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

			assetData = append(assetData, bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   fmt.Sprintf("asset%d", i),
				"team": fmt.Sprintf("team%d", i%10),
				"name": fmt.Sprintf("Asset %d", i),
			})
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		_, err = sceneCollection.InsertMany(ctx, sceneData)
		require.NoError(t, err)

		_, err = assetCollection.InsertMany(ctx, assetData)
		require.NoError(t, err)

		// Execute migration
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify all documents have been migrated
		teamCount, err := projectCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), teamCount)

		workspaceCount, err := projectCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), workspaceCount)

		sceneTeamCount, err := sceneCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), sceneTeamCount)

		sceneWorkspaceCount, err := sceneCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), sceneWorkspaceCount)

		assetTeamCount, err := assetCollection.CountDocuments(ctx, bson.M{"team": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), assetTeamCount)

		assetWorkspaceCount, err := assetCollection.CountDocuments(ctx, bson.M{"workspace": bson.M{"$exists": true}})
		require.NoError(t, err)
		assert.Equal(t, int64(100), assetWorkspaceCount)
	})

	t.Run("idempotent - running migration twice has no additional effect", func(t *testing.T) {
		// Clear collections
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert test data
		projectData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   "project1",
				"team": "team1",
				"name": "Test Project 1",
			},
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Run migration first time
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify workspace field was added
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "team1", project1["team"])
		assert.Equal(t, "team1", project1["workspace"])

		// Run migration second time
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify no changes occurred
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "team1", project1["team"])
		assert.Equal(t, "team1", project1["workspace"])

		// Verify only one document exists
		count, err := projectCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(1), count)
	})

	t.Run("handles malformed ID fields gracefully", func(t *testing.T) {
		// Clear collection
		_, err := projectCollection.DeleteMany(ctx, bson.M{})
		require.NoError(t, err)

		// Setup: Insert documents with non-string team fields
		projectData := []interface{}{
			bson.M{
				"_id":  primitive.NewObjectID(),
				"team": 123, // Numeric team
				"id":   "project1",
			},
			bson.M{
				"_id": primitive.NewObjectID(),
				"id":  "project2", // Missing team field
			},
		}

		_, err = projectCollection.InsertMany(ctx, projectData)
		require.NoError(t, err)

		// Execute migration (should not crash)
		err = CopyTeamToWorkspace(ctx, client)
		require.NoError(t, err)

		// Verify documents are unchanged
		count, err := projectCollection.CountDocuments(ctx, bson.M{})
		require.NoError(t, err)
		assert.Equal(t, int64(2), count, "Both documents should still exist")
	})
}
