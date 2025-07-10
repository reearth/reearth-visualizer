package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func clearDb(t *testing.T, ctx context.Context, sceneCollection *mongo.Collection, projectCollection *mongo.Collection) {
	_, err := sceneCollection.DeleteMany(ctx, bson.M{})
	require.NoError(t, err)
	_, err = projectCollection.DeleteMany(ctx, bson.M{})
	require.NoError(t, err)
}

// go test -v -run TestSetProjectAlias ./internal/infrastructure/mongo/migration/...

func TestSetProjectAlias(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	// Get collections for testing
	sceneCollection := client.WithCollection("scene").Client()
	projectCollection := client.WithCollection("project").Client()

	// Clear test data
	clearDb(t, ctx, sceneCollection, projectCollection)

	t.Run("should update project and scene with empty alias", func(t *testing.T) {
		// Prepare test data
		sceneID := "01jzpkgkjxxj53zxmn9rqc7z12"
		projectID := "01jzpkgkexd9zxnv6pcc69f1k8"
		teamID := "01jzpkg72bh3yzv7y0hfajecp8"

		// Insert scene
		scene := bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      sceneID,
			"project": projectID,
			"team":    teamID,
		}
		_, err := sceneCollection.InsertOne(ctx, scene)
		require.NoError(t, err)

		// Insert project (without alias)
		project := bson.M{
			"_id":  primitive.NewObjectID(),
			"id":   projectID,
			"team": teamID,
			"name": "test",
		}
		_, err = projectCollection.InsertOne(ctx, project)
		require.NoError(t, err)

		// Execute migration
		err = SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify project result
		var updatedProject bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&updatedProject)
		require.NoError(t, err)
		expectedAlias := "c-" + sceneID
		assert.Equal(t, expectedAlias, updatedProject["alias"])

		// Verify scene result
		var updatedScene bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": sceneID}).Decode(&updatedScene)
		require.NoError(t, err)
		assert.Equal(t, expectedAlias, updatedScene["alias"])
	})

	t.Run("should update project and scene with nil alias", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		sceneID := "01jzpkgkjxxj53zxmn9rqc7z13"
		projectID := "01jzpkgkexd9zxnv6pcc69f1k9"
		teamID := "01jzpkg72bh3yzv7y0hfajecp9"

		// Insert scene
		scene := bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      sceneID,
			"project": projectID,
			"team":    teamID,
		}
		_, err := sceneCollection.InsertOne(ctx, scene)
		require.NoError(t, err)

		// Insert project with nil alias
		project := bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    projectID,
			"team":  teamID,
			"name":  "test",
			"alias": nil,
		}
		_, err = projectCollection.InsertOne(ctx, project)
		require.NoError(t, err)

		// Execute migration
		err = SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify project result
		var updatedProject bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&updatedProject)
		require.NoError(t, err)
		expectedAlias := "c-" + sceneID
		assert.Equal(t, expectedAlias, updatedProject["alias"])

		// Verify scene result
		var updatedScene bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": sceneID}).Decode(&updatedScene)
		require.NoError(t, err)
		assert.Equal(t, expectedAlias, updatedScene["alias"])
	})

	t.Run("should update project and scene with empty string alias", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		sceneID := "01jzpkgkjxxj53zxmn9rqc7z14"
		projectID := "01jzpkgkexd9zxnv6pcc69f1k10"
		teamID := "01jzpkg72bh3yzv7y0hfajecp10"

		// Insert scene
		scene := bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      sceneID,
			"project": projectID,
			"team":    teamID,
		}
		_, err := sceneCollection.InsertOne(ctx, scene)
		require.NoError(t, err)

		// Insert project with empty string alias
		project := bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    projectID,
			"team":  teamID,
			"name":  "test",
			"alias": "",
		}
		_, err = projectCollection.InsertOne(ctx, project)
		require.NoError(t, err)

		// Execute migration
		err = SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify project result
		var updatedProject bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&updatedProject)
		require.NoError(t, err)
		expectedAlias := "c-" + sceneID
		assert.Equal(t, expectedAlias, updatedProject["alias"])

		// Verify scene result
		var updatedScene bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": sceneID}).Decode(&updatedScene)
		require.NoError(t, err)
		assert.Equal(t, expectedAlias, updatedScene["alias"])
	})

	t.Run("should not update project but update scene with existing project alias", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		sceneID := "01jzpkgkjxxj53zxmn9rqc7z15"
		projectID := "01jzpkgkexd9zxnv6pcc69f1k11"
		teamID := "01jzpkg72bh3yzv7y0hfajecp11"
		existingAlias := "existing-alias"

		// Insert scene
		scene := bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      sceneID,
			"project": projectID,
			"team":    teamID,
		}
		_, err := sceneCollection.InsertOne(ctx, scene)
		require.NoError(t, err)

		// Insert project with existing alias
		project := bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    projectID,
			"team":  teamID,
			"name":  "test",
			"alias": existingAlias,
		}
		_, err = projectCollection.InsertOne(ctx, project)
		require.NoError(t, err)

		// Execute migration
		err = SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify project result (alias should not be changed)
		var updatedProject bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&updatedProject)
		require.NoError(t, err)
		assert.Equal(t, existingAlias, updatedProject["alias"])

		// Verify scene result (should get the existing project alias)
		var updatedScene bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": sceneID}).Decode(&updatedScene)
		require.NoError(t, err)
		assert.Equal(t, existingAlias, updatedScene["alias"])
	})

	t.Run("should process multiple scene and project pairs", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		testCases := []struct {
			sceneID   string
			projectID string
			teamID    string
		}{
			{"scene1", "project1", "team1"},
			{"scene2", "project2", "team2"},
			{"scene3", "project3", "team3"},
		}

		// Insert test data
		for _, tc := range testCases {
			// Insert scene
			scene := bson.M{
				"_id":     primitive.NewObjectID(),
				"id":      tc.sceneID,
				"project": tc.projectID,
				"team":    tc.teamID,
			}
			_, err := sceneCollection.InsertOne(ctx, scene)
			require.NoError(t, err)

			// Insert project
			project := bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   tc.projectID,
				"team": tc.teamID,
				"name": "test",
			}
			_, err = projectCollection.InsertOne(ctx, project)
			require.NoError(t, err)
		}

		// Execute migration
		err := SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify results
		for _, tc := range testCases {
			expectedAlias := "c-" + tc.sceneID

			// Verify project
			var updatedProject bson.M
			err = projectCollection.FindOne(ctx, bson.M{"id": tc.projectID}).Decode(&updatedProject)
			require.NoError(t, err)
			assert.Equal(t, expectedAlias, updatedProject["alias"])

			// Verify scene
			var updatedScene bson.M
			err = sceneCollection.FindOne(ctx, bson.M{"id": tc.sceneID}).Decode(&updatedScene)
			require.NoError(t, err)
			assert.Equal(t, expectedAlias, updatedScene["alias"])
		}
	})

	t.Run("should ignore scene without corresponding project", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		sceneID := "01jzpkgkjxxj53zxmn9rqc7z16"
		projectID := "01jzpkgkexd9zxnv6pcc69f1k12"
		teamID := "01jzpkg72bh3yzv7y0hfajecp12"

		// Insert scene only (no corresponding project)
		scene := bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      sceneID,
			"project": projectID,
			"team":    teamID,
		}
		_, err := sceneCollection.InsertOne(ctx, scene)
		require.NoError(t, err)

		// Execute migration (should not error)
		err = SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify project does not exist
		var project bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&project)
		assert.Error(t, err) // Should return mongo.ErrNoDocuments

		// Verify scene should not have alias since project doesn't exist
		var updatedScene bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": sceneID}).Decode(&updatedScene)
		require.NoError(t, err)
		_, hasAlias := updatedScene["alias"]
		assert.False(t, hasAlias) // Scene should not have alias field
	})

	t.Run("should handle empty scene collection", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		// Execute migration (should not error)
		err := SetProjectAlias(ctx, client)
		require.NoError(t, err)
	})

	t.Run("should handle scene with existing alias", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		sceneID := "01jzpkgkjxxj53zxmn9rqc7z17"
		projectID := "01jzpkgkexd9zxnv6pcc69f1k13"
		teamID := "01jzpkg72bh3yzv7y0hfajecp13"
		existingProjectAlias := "existing-project-alias"

		// Insert scene with existing alias
		scene := bson.M{
			"_id":     primitive.NewObjectID(),
			"id":      sceneID,
			"project": projectID,
			"team":    teamID,
			"alias":   "old-scene-alias",
		}
		_, err := sceneCollection.InsertOne(ctx, scene)
		require.NoError(t, err)

		// Insert project with existing alias
		project := bson.M{
			"_id":   primitive.NewObjectID(),
			"id":    projectID,
			"team":  teamID,
			"name":  "test",
			"alias": existingProjectAlias,
		}
		_, err = projectCollection.InsertOne(ctx, project)
		require.NoError(t, err)

		// Execute migration
		err = SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify project alias remains unchanged
		var updatedProject bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": projectID}).Decode(&updatedProject)
		require.NoError(t, err)
		assert.Equal(t, existingProjectAlias, updatedProject["alias"])

		// Verify scene alias is updated to match project alias
		var updatedScene bson.M
		err = sceneCollection.FindOne(ctx, bson.M{"id": sceneID}).Decode(&updatedScene)
		require.NoError(t, err)
		assert.Equal(t, existingProjectAlias, updatedScene["alias"])
	})

	t.Run("should handle mixed scenarios", func(t *testing.T) {
		// Clear test data
		clearDb(t, ctx, sceneCollection, projectCollection)

		testCases := []struct {
			sceneID          string
			projectID        string
			teamID           string
			projectAlias     interface{} // nil, "", or string
			expectedAlias    string
			shouldUpdateProj bool
		}{
			{"scene1", "project1", "team1", nil, "c-scene1", true},
			{"scene2", "project2", "team2", "", "c-scene2", true},
			{"scene3", "project3", "team3", "existing-alias", "existing-alias", false},
		}

		// Insert test data
		for _, tc := range testCases {
			// Insert scene
			scene := bson.M{
				"_id":     primitive.NewObjectID(),
				"id":      tc.sceneID,
				"project": tc.projectID,
				"team":    tc.teamID,
			}
			_, err := sceneCollection.InsertOne(ctx, scene)
			require.NoError(t, err)

			// Insert project
			project := bson.M{
				"_id":  primitive.NewObjectID(),
				"id":   tc.projectID,
				"team": tc.teamID,
				"name": "test",
			}
			if tc.projectAlias != nil {
				project["alias"] = tc.projectAlias
			}
			_, err = projectCollection.InsertOne(ctx, project)
			require.NoError(t, err)
		}

		// Execute migration
		err := SetProjectAlias(ctx, client)
		require.NoError(t, err)

		// Verify results
		for _, tc := range testCases {
			// Verify project
			var updatedProject bson.M
			err = projectCollection.FindOne(ctx, bson.M{"id": tc.projectID}).Decode(&updatedProject)
			require.NoError(t, err)
			assert.Equal(t, tc.expectedAlias, updatedProject["alias"])

			// Verify scene
			var updatedScene bson.M
			err = sceneCollection.FindOne(ctx, bson.M{"id": tc.sceneID}).Decode(&updatedScene)
			require.NoError(t, err)
			assert.Equal(t, tc.expectedAlias, updatedScene["alias"])
		}
	})
}
