package migration

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

// TestRevertRemoveLegacyImportStatusFields_RestoresFields verifies that
// status/result log from projectimport are written back onto the matching
// projectmetadata document's legacy fields.
func TestRevertRemoveLegacyImportStatusFields_RestoresFields(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()
	importCol := client.WithCollection("projectimport").Client()

	_, err := metadataCol.InsertOne(ctx, bson.M{"project": "p1", "readme": "keep me"})
	require.NoError(t, err)

	resultLog := bson.M{"message": "done"}
	_, err = importCol.InsertOne(ctx, bson.M{
		"project":   "p1",
		"status":    "SUCCESS",
		"resultlog": resultLog,
		"updatedat": phase1RolloutDate.Add(24 * time.Hour),
	})
	require.NoError(t, err)

	require.NoError(t, RevertRemoveLegacyImportStatusFields(ctx, client))

	var doc bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "p1"}).Decode(&doc))
	assert.Equal(t, "SUCCESS", doc["importstatus"])
	assert.Equal(t, "done", doc["importresultlog"].(bson.M)["message"])
	assert.Equal(t, "keep me", doc["readme"], "unrelated fields must survive the revert")
}

// TestRevertRemoveLegacyImportStatusFields_SkipsRecordsBeforeRollout verifies
// that projectimport documents updated before Phase 1's rollout date are
// ignored - they predate projectimport entirely and shouldn't occur in
// practice, but the migration guards against them anyway.
func TestRevertRemoveLegacyImportStatusFields_SkipsRecordsBeforeRollout(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()
	importCol := client.WithCollection("projectimport").Client()

	_, err := metadataCol.InsertOne(ctx, bson.M{"project": "p1", "readme": "keep me"})
	require.NoError(t, err)

	_, err = importCol.InsertOne(ctx, bson.M{
		"project":   "p1",
		"status":    "SUCCESS",
		"updatedat": phase1RolloutDate.Add(-24 * time.Hour),
	})
	require.NoError(t, err)

	require.NoError(t, RevertRemoveLegacyImportStatusFields(ctx, client))

	var doc bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "p1"}).Decode(&doc))
	assert.NotContains(t, doc, "importstatus")
}

// TestRemoveLegacyAndRevert_RoundTrip verifies that running the forward
// migration followed by the revert restores the original legacy fields.
func TestRemoveLegacyAndRevert_RoundTrip(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()

	resultLog := bson.M{"message": "boom"}
	_, err := metadataCol.InsertOne(ctx, bson.M{
		"project":         "p1",
		"importstatus":    "FAILED",
		"importresultlog": resultLog,
		"readme":          "keep me",
	})
	require.NoError(t, err)

	// Forward migration: copies into projectimport (via the application's
	// normal save path is not exercised here, so seed projectimport directly
	// to simulate Phase 1 having already run) and unsets the legacy fields.
	importCol := client.WithCollection("projectimport").Client()
	_, err = importCol.InsertOne(ctx, bson.M{
		"project":   "p1",
		"status":    "FAILED",
		"resultlog": resultLog,
		"updatedat": phase1RolloutDate.Add(24 * time.Hour),
	})
	require.NoError(t, err)

	require.NoError(t, RemoveLegacyImportStatusFields(ctx, client))

	var afterRemove bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "p1"}).Decode(&afterRemove))
	assert.NotContains(t, afterRemove, "importstatus")

	require.NoError(t, RevertRemoveLegacyImportStatusFields(ctx, client))

	var afterRevert bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "p1"}).Decode(&afterRevert))
	assert.Equal(t, "FAILED", afterRevert["importstatus"])
	assert.Equal(t, "boom", afterRevert["importresultlog"].(bson.M)["message"])
	assert.Equal(t, "keep me", afterRevert["readme"])
}
