package mongo

import (
	"context"
	"testing"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestProjectMetadata(t *testing.T, wid accountsID.WorkspaceID, pid id.ProjectID, status *project.ProjectImportStatus, resultLog *map[string]any) *project.ProjectMetadata {
	t.Helper()
	m, err := project.NewProjectMetadata().
		NewID().
		Workspace(wid).
		Project(pid).
		ImportStatus(status).
		ImportResultLog(resultLog).
		Build()
	require.NoError(t, err)
	return m
}

// TestProjectMetadata_Save_WritesOnlyToProjectImport verifies that saving a
// ProjectMetadata with import status/log writes to the projectimport
// document only - the legacy projectmetadata fields are no longer written.
func TestProjectMetadata_Save_WritesOnlyToProjectImport(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	wid := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()
	status := project.ProjectImportStatusFailed
	resultLog := map[string]any{"message": "boom"}
	m := newTestProjectMetadata(t, wid, pid, &status, &resultLog)

	ctx := context.Background()
	require.NoError(t, r.Save(ctx, m))

	var doc struct {
		ImportStatus *string `bson:"importstatus"`
	}
	err := client.WithCollection("projectmetadata").Client().FindOne(ctx, map[string]any{"project": pid.String()}).Decode(&doc)
	require.NoError(t, err)
	assert.Nil(t, doc.ImportStatus, "importstatus must no longer be written to the legacy projectmetadata field")

	var importDoc struct {
		Status string `bson:"status"`
	}
	err = client.WithCollection("projectimport").Client().FindOne(ctx, map[string]any{"project": pid.String()}).Decode(&importDoc)
	require.NoError(t, err)
	assert.Equal(t, "FAILED", importDoc.Status)
}

// TestProjectMetadata_FindByProjectID_PrefersProjectImportOverLegacy
// verifies the phase-1 read precedence: when both the legacy
// projectmetadata fields and a projectimport document exist but disagree
// (e.g. a write landed in projectimport but the legacy field is stale), the
// projectimport value wins.
func TestProjectMetadata_FindByProjectID_PrefersProjectImportOverLegacy(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	wid := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()
	status := project.ProjectImportStatusProcessing
	m := newTestProjectMetadata(t, wid, pid, &status, nil)

	ctx := context.Background()
	require.NoError(t, r.Save(ctx, m))

	// Simulate a stale legacy field left behind by an older write path.
	_, err := client.WithCollection("projectmetadata").Client().UpdateOne(ctx,
		map[string]any{"project": pid.String()},
		map[string]any{"$set": map[string]any{"importstatus": "FAILED"}},
	)
	require.NoError(t, err)

	got, err := r.FindByProjectID(ctx, pid)
	require.NoError(t, err)
	require.NotNil(t, got.ImportStatus())
	assert.Equal(t, project.ProjectImportStatusProcessing, *got.ImportStatus(), "projectimport must win over a stale legacy field")
}

// TestProjectMetadata_FindByProjectID_FallsBackToLegacyField verifies the
// phase-1 read fallback: if no projectimport document exists yet (e.g. a
// document written before this migration/rollout), the legacy
// projectmetadata field is used instead of returning nil.
func TestProjectMetadata_FindByProjectID_FallsBackToLegacyField(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	pid := id.NewProjectID()
	_, err := client.WithCollection("projectmetadata").Client().InsertOne(context.Background(), map[string]any{
		"id":           id.NewProjectMetadataID().String(),
		"workspace":    accountsID.NewWorkspaceID().String(),
		"project":      pid.String(),
		"importstatus": "SUCCESS",
	})
	require.NoError(t, err)

	got, err := r.FindByProjectID(context.Background(), pid)
	require.NoError(t, err)
	require.NotNil(t, got.ImportStatus(), "must fall back to the legacy field when no projectimport doc exists")
	assert.Equal(t, project.ProjectImportStatusSuccess, *got.ImportStatus())
}

// TestProjectMetadata_FindByProjectID_MergesImportFields verifies that
// reading a project's metadata back merges in the status/log stored in the
// separate projectimport collection.
func TestProjectMetadata_FindByProjectID_MergesImportFields(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	wid := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()
	status := project.ProjectImportStatusSuccess
	resultLog := map[string]any{"message": "done"}
	m := newTestProjectMetadata(t, wid, pid, &status, &resultLog)

	ctx := context.Background()
	require.NoError(t, r.Save(ctx, m))

	got, err := r.FindByProjectID(ctx, pid)
	require.NoError(t, err)
	require.NotNil(t, got.ImportStatus())
	assert.Equal(t, project.ProjectImportStatusSuccess, *got.ImportStatus())
	require.NotNil(t, got.ImportResultLog())
	assert.Equal(t, "done", (*got.ImportResultLog())["message"])
}

// TestProjectMetadata_NoImportActivity_NoProjectImportDoc verifies that a
// project that has never had a status/log set never gets a projectimport
// document, and reads back with a nil ImportStatus/ImportResultLog.
func TestProjectMetadata_NoImportActivity_NoProjectImportDoc(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	wid := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()
	m := newTestProjectMetadata(t, wid, pid, nil, nil)

	ctx := context.Background()
	require.NoError(t, r.Save(ctx, m))

	count, err := client.WithCollection("projectimport").Client().CountDocuments(ctx, map[string]any{"project": pid.String()})
	require.NoError(t, err)
	assert.Zero(t, count, "no projectimport doc should be created for a project with no import activity")

	got, err := r.FindByProjectID(ctx, pid)
	require.NoError(t, err)
	assert.Nil(t, got.ImportStatus())
	assert.Nil(t, got.ImportResultLog())
}

// TestProjectMetadata_Save_UnrelatedUpdateDoesNotRefreshImportTTL verifies
// that saving a project for an unrelated reason (e.g. a readme edit) does
// not rewrite the projectimport doc's updatedat when the import status/log
// hasn't actually changed - otherwise every unrelated edit would reset the
// TTL clock and the doc would never expire.
func TestProjectMetadata_Save_UnrelatedUpdateDoesNotRefreshImportTTL(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)
	importCol := client.WithCollection("projectimport").Client()

	wid := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()
	status := project.ProjectImportStatusSuccess
	m := newTestProjectMetadata(t, wid, pid, &status, nil)

	ctx := context.Background()
	require.NoError(t, r.Save(ctx, m))

	var before struct {
		UpdatedAt time.Time `bson:"updatedat"`
	}
	require.NoError(t, importCol.FindOne(ctx, map[string]any{"project": pid.String()}).Decode(&before))

	// Simulate an unrelated metadata edit (readme) some time later, with the
	// domain object still carrying the same (unchanged) import status.
	readme := "updated readme"
	m.SetReadme(&readme)
	require.NoError(t, r.Save(ctx, m))

	var after struct {
		UpdatedAt time.Time `bson:"updatedat"`
	}
	require.NoError(t, importCol.FindOne(ctx, map[string]any{"project": pid.String()}).Decode(&after))

	assert.True(t, before.UpdatedAt.Equal(after.UpdatedAt), "unrelated save must not refresh projectimport.updatedat when import status/log is unchanged")
}

// TestProjectMetadata_Remove_CleansUpImportDoc verifies that removing a
// project's metadata also removes its projectimport document.
func TestProjectMetadata_Remove_CleansUpImportDoc(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	wid := accountsID.NewWorkspaceID()
	pid := id.NewProjectID()
	status := project.ProjectImportStatusFailed
	m := newTestProjectMetadata(t, wid, pid, &status, nil)

	ctx := context.Background()
	require.NoError(t, r.Save(ctx, m))
	require.NoError(t, r.Remove(ctx, pid))

	count, err := client.WithCollection("projectimport").Client().CountDocuments(ctx, map[string]any{"project": pid.String()})
	require.NoError(t, err)
	assert.Zero(t, count, "projectimport doc must be removed alongside projectmetadata")
}

// TestProjectMetadata_ClaimImport_NoExistingRecord verifies that a project
// with no projectimport doc yet can be claimed.
func TestProjectMetadata_ClaimImport_NoExistingRecord(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)

	pid := id.NewProjectID()
	claimed, err := r.ClaimImport(context.Background(), pid, time.Minute)
	require.NoError(t, err)
	assert.True(t, claimed)
}

// TestProjectMetadata_ClaimImport_RefusesAlreadySucceeded is the regression
// test for the bug where a filter designed to exclude SUCCESS records from
// matching, combined with upsert=true and the unique index on project,
// caused an attempted insert that collided with the existing document and
// surfaced a duplicate-key error instead of a clean "not claimed".
func TestProjectMetadata_ClaimImport_RefusesAlreadySucceeded(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)
	importCol := client.WithCollection("projectimport").Client()

	pid := id.NewProjectID()
	_, err := importCol.InsertOne(context.Background(), map[string]any{
		"project":   pid.String(),
		"status":    "SUCCESS",
		"updatedat": time.Now().UTC(),
	})
	require.NoError(t, err)

	claimed, err := r.ClaimImport(context.Background(), pid, time.Minute)
	require.NoError(t, err, "must not surface a duplicate-key error")
	assert.False(t, claimed)
}

// TestProjectMetadata_ClaimImport_RefusesFreshProcessing verifies that a
// PROCESSING record within the staleness window refuses the claim without
// erroring.
func TestProjectMetadata_ClaimImport_RefusesFreshProcessing(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)
	importCol := client.WithCollection("projectimport").Client()

	pid := id.NewProjectID()
	_, err := importCol.InsertOne(context.Background(), map[string]any{
		"project":   pid.String(),
		"status":    "PROCESSING",
		"updatedat": time.Now().UTC(),
	})
	require.NoError(t, err)

	claimed, err := r.ClaimImport(context.Background(), pid, time.Hour)
	require.NoError(t, err)
	assert.False(t, claimed)
}

// TestProjectMetadata_ClaimImport_ReclaimsStaleProcessing verifies that a
// PROCESSING record past the staleness window can be reclaimed.
func TestProjectMetadata_ClaimImport_ReclaimsStaleProcessing(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)
	importCol := client.WithCollection("projectimport").Client()

	pid := id.NewProjectID()
	_, err := importCol.InsertOne(context.Background(), map[string]any{
		"project":   pid.String(),
		"status":    "PROCESSING",
		"updatedat": time.Now().UTC().Add(-time.Hour),
	})
	require.NoError(t, err)

	claimed, err := r.ClaimImport(context.Background(), pid, time.Minute)
	require.NoError(t, err)
	assert.True(t, claimed)

	var doc struct {
		Status string `bson:"status"`
	}
	require.NoError(t, importCol.FindOne(context.Background(), map[string]any{"project": pid.String()}).Decode(&doc))
	assert.Equal(t, "PROCESSING", doc.Status)
}

// TestProjectMetadata_ClaimImport_ClaimsFailed verifies that a FAILED record
// can be claimed (retry after a prior failure).
func TestProjectMetadata_ClaimImport_ClaimsFailed(t *testing.T) {
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	r := NewProjectMetadata(client)
	importCol := client.WithCollection("projectimport").Client()

	pid := id.NewProjectID()
	_, err := importCol.InsertOne(context.Background(), map[string]any{
		"project":   pid.String(),
		"status":    "FAILED",
		"updatedat": time.Now().UTC(),
	})
	require.NoError(t, err)

	claimed, err := r.ClaimImport(context.Background(), pid, time.Minute)
	require.NoError(t, err)
	assert.True(t, claimed)
}
