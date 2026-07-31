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

// TestMoveImportStatusToOwnCollection_MovesData verifies that documents with
// importstatus/importresultlog are copied into projectimport. The legacy
// fields are deliberately left on projectmetadata (dual-write phase; a
// later migration removes them once that's proven stable), while documents
// that were never imported are left untouched and get no projectimport doc.
func TestMoveImportStatusToOwnCollection_MovesData(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()
	importCol := client.WithCollection("projectimport").Client()

	resultLog := bson.M{"message": "fail Import ProjectData: boom"}
	docs := []interface{}{
		bson.M{"project": "imported-failed", "importstatus": "FAILED", "importresultlog": resultLog, "readme": "keep me"},
		bson.M{"project": "imported-success", "importstatus": "SUCCESS"},
		bson.M{"project": "never-imported", "readme": "untouched"},
	}
	_, err := metadataCol.InsertMany(ctx, docs)
	require.NoError(t, err)

	require.NoError(t, MoveImportStatusToOwnCollection(ctx, client))

	// Copied: projectimport now has the status/log.
	var imported struct {
		Status    string `bson:"status"`
		ResultLog bson.M `bson:"resultlog"`
	}
	require.NoError(t, importCol.FindOne(ctx, bson.M{"project": "imported-failed"}).Decode(&imported))
	assert.Equal(t, "FAILED", imported.Status)
	assert.Equal(t, "fail Import ProjectData: boom", imported.ResultLog["message"])

	// Legacy fields on projectmetadata are left in place during the
	// dual-write phase, alongside unrelated fields.
	var meta bson.M
	require.NoError(t, metadataCol.FindOne(ctx, bson.M{"project": "imported-failed"}).Decode(&meta))
	assert.Equal(t, "FAILED", meta["importstatus"])
	assert.Equal(t, "keep me", meta["readme"], "unrelated fields must survive the migration")

	var importedSuccess struct {
		Status string `bson:"status"`
	}
	require.NoError(t, importCol.FindOne(ctx, bson.M{"project": "imported-success"}).Decode(&importedSuccess))
	assert.Equal(t, "SUCCESS", importedSuccess.Status)

	// Untouched: a project that was never imported gets no projectimport doc.
	err = importCol.FindOne(ctx, bson.M{"project": "never-imported"}).Err()
	assert.ErrorIs(t, err, mongo.ErrNoDocuments)
}

// TestMoveImportStatusToOwnCollection_CreatesIndexes verifies the unique
// index on project and the TTL index on updatedat are both created with the
// expected options.
func TestMoveImportStatusToOwnCollection_CreatesIndexes(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	col := client.WithCollection("projectimport").Client()

	require.NoError(t, MoveImportStatusToOwnCollection(ctx, client))

	idxCur, err := col.Indexes().List(ctx)
	require.NoError(t, err)
	defer idxCur.Close(ctx)

	found := map[string]bson.M{}
	for idxCur.Next(ctx) {
		var spec bson.M
		require.NoError(t, idxCur.Decode(&spec))
		found[spec["name"].(string)] = spec
	}
	require.NoError(t, idxCur.Err())

	unique, ok := found["projectimport_project"]
	require.True(t, ok, "expected unique index on project")
	assert.Equal(t, true, unique["unique"])

	ttl, ok := found["projectimport_updatedat_ttl"]
	require.True(t, ok, "expected TTL index on updatedat")
	assert.EqualValues(t, projectImportTTLSeconds, ttl["expireAfterSeconds"])
}

// TestMoveImportStatusToOwnCollection_Idempotent ensures re-running the
// migration on already-migrated data does not error and does not duplicate
// or corrupt the projectimport document.
func TestMoveImportStatusToOwnCollection_Idempotent(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	metadataCol := client.WithCollection("projectmetadata").Client()
	importCol := client.WithCollection("projectimport").Client()

	_, err := metadataCol.InsertOne(ctx, bson.M{"project": "p1", "importstatus": "SUCCESS"})
	require.NoError(t, err)

	require.NoError(t, MoveImportStatusToOwnCollection(ctx, client))
	require.NoError(t, MoveImportStatusToOwnCollection(ctx, client))

	count, err := importCol.CountDocuments(ctx, bson.M{"project": "p1"})
	require.NoError(t, err)
	assert.Equal(t, int64(1), count, "re-running must not duplicate the projectimport doc")
}
