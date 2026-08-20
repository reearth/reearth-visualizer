package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

// TestRemoveLegacyImportStatusFields_UnsetsLegacyFields verifies that
// importstatus/importresultlog are removed from projectmetadata documents
// that have them, while unrelated fields and untouched documents survive.
func TestRemoveLegacyImportStatusFields_UnsetsLegacyFields(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()

	resultLog := bson.M{"message": "fail Import ProjectData: boom"}
	docs := []any{
		bson.M{"project": "imported-failed", "importstatus": "FAILED", "importresultlog": resultLog, "readme": "keep me"},
		bson.M{"project": "imported-success", "importstatus": "SUCCESS"},
		bson.M{"project": "never-imported", "readme": "untouched"},
	}
	_, err := metadataCol.InsertMany(ctx, docs)
	require.NoError(t, err)

	require.NoError(t, RemoveLegacyImportStatusFields(ctx, client))

	var failed bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "imported-failed"}).Decode(&failed))
	assert.NotContains(t, failed, "importstatus")
	assert.NotContains(t, failed, "importresultlog")
	assert.Equal(t, "keep me", failed["readme"], "unrelated fields must survive the migration")

	var success bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "imported-success"}).Decode(&success))
	assert.NotContains(t, success, "importstatus")

	var untouched bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "never-imported"}).Decode(&untouched))
	assert.Equal(t, "untouched", untouched["readme"])
}

// TestRemoveLegacyImportStatusFields_Idempotent ensures re-running the
// migration on already-cleaned data does not error.
func TestRemoveLegacyImportStatusFields_Idempotent(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()

	_, err := metadataCol.InsertOne(ctx, bson.M{"project": "p1", "importstatus": "SUCCESS"})
	require.NoError(t, err)

	require.NoError(t, RemoveLegacyImportStatusFields(ctx, client))
	require.NoError(t, RemoveLegacyImportStatusFields(ctx, client))

	var doc bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "p1"}).Decode(&doc))
	assert.NotContains(t, doc, "importstatus")
}

// TestRemoveLegacyImportStatusFields_NoMatches verifies the migration is a
// no-op when no documents have the legacy fields.
func TestRemoveLegacyImportStatusFields_NoMatches(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()

	_, err := metadataCol.InsertOne(ctx, bson.M{"project": "p1", "readme": "hello"})
	require.NoError(t, err)

	require.NoError(t, RemoveLegacyImportStatusFields(ctx, client))

	var doc bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "p1"}).Decode(&doc))
	assert.Equal(t, "hello", doc["readme"])
}
