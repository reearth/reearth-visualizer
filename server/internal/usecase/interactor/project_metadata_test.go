package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/testutil/factory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func createNewProjectMetadataUC(client *mongox.Client) *ProjectMetadata {
	return &ProjectMetadata{
		commonSceneLock:     commonSceneLock{sceneLockRepo: mongo.NewSceneLock(client)},
		projectMetadataRepo: mongo.NewProjectMetadata(client),
		transaction:         client.Transaction(),
	}
}

func TestProjectMetadata_CreateAndFindByProjectID(t *testing.T) {
	ctx := context.Background()
	mongotest.Env = "REEARTH_DB"
	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectMetadataUC(client)

	ws := factory.NewWorkspace()
	_ = accountmongo.NewWorkspace(client).Save(ctx, ws)
	pid := id.NewProjectID()
	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	}

	readme := "readme content"
	license := "MIT"
	topics := []string{"go", "test"}
	starCount := int64(5)
	userID := accountdomain.NewUserID()
	starredBy := []string{userID.String()}
	param := interfaces.CreateProjectMetadataParam{
		ProjectID:   pid,
		WorkspaceID: ws.ID(),
		Readme:      &readme,
		License:     &license,
		Topics:      &topics,
		StarCount:   &starCount,
		StarredBy:   &starredBy,
	}

	meta, err := uc.Create(ctx, param, operator)
	assert.NoError(t, err)
	assert.NotNil(t, meta)
	assert.Equal(t, param.ProjectID, meta.Project())
	assert.Equal(t, param.WorkspaceID, meta.Workspace())
	assert.Equal(t, param.Readme, meta.Readme())
	assert.Equal(t, param.License, meta.License())
	assert.Equal(t, param.Topics, meta.Topics())
	assert.Equal(t, param.StarCount, meta.StarCount())
	assert.Equal(t, param.StarredBy, meta.StarredBy())

	// Test FindByProjectID
	found, err := uc.FindByProjectID(ctx, pid, operator)
	assert.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, meta.ID(), found.ID())
}

func TestProjectMetadata_Update(t *testing.T) {
	ctx := context.Background()
	mongotest.Env = "REEARTH_DB"
	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectMetadataUC(client)

	ws := factory.NewWorkspace()
	_ = accountmongo.NewWorkspace(client).Save(ctx, ws)
	pid := id.NewProjectID()
	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	}

	// Create initial metadata
	readme := "readme content"
	license := "MIT"
	topics := []string{"go", "test"}
	starCount := int64(5)
	userID := accountdomain.NewUserID()
	starredBy := []string{userID.String()}
	param := interfaces.CreateProjectMetadataParam{
		ProjectID:   pid,
		WorkspaceID: ws.ID(),
		Readme:      &readme,
		License:     &license,
		Topics:      &topics,
		StarCount:   &starCount,
		StarredBy:   &starredBy,
	}
	meta, err := uc.Create(ctx, param, operator)
	assert.NoError(t, err)
	assert.NotNil(t, meta)

	// Update fields
	newReadme := "updated readme"
	newLicense := "Apache-2.0"
	newTopics := []string{"go", "update"}
	newStarCount := int64(10)
	newStarredBy := []string{accountdomain.NewUserID().String(), accountdomain.NewUserID().String()}
	updateParam := interfaces.UpdateProjectMetadataParam{
		ID:        pid,
		Readme:    &newReadme,
		License:   &newLicense,
		Topics:    &newTopics,
		StarCount: &newStarCount,
		StarredBy: &newStarredBy,
	}
	updated, err := uc.Update(ctx, updateParam, operator)
	assert.NoError(t, err)
	assert.NotNil(t, updated)
	assert.Equal(t, &newReadme, updated.Readme())
	assert.Equal(t, &newLicense, updated.License())
	assert.Equal(t, &newTopics, updated.Topics())
	assert.Equal(t, &newStarCount, updated.StarCount())
	assert.Equal(t, &newStarredBy, updated.StarredBy())
	assert.True(t, updated.UpdatedAt().After(*meta.UpdatedAt()) || updated.UpdatedAt().Equal(*meta.UpdatedAt()))
}

func TestProjectMetadata_FindByProjectID_NotFound(t *testing.T) {
	ctx := context.Background()
	mongotest.Env = "REEARTH_DB"
	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectMetadataUC(client)

	ws := factory.NewWorkspace()
	_ = accountmongo.NewWorkspace(client).Save(ctx, ws)
	pid := id.NewProjectID()
	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	}

	found, err := uc.FindByProjectID(ctx, pid, operator)
	assert.Error(t, err)
	assert.Nil(t, found)
}

func TestProjectMetadata_PatchStarCountForAnyUser(t *testing.T) {
	ctx := context.Background()
	mongotest.Env = "REEARTH_DB"
	db := mongotest.Connect(t)(t)
	client := mongox.NewClient(db.Name(), db.Client())
	uc := createNewProjectMetadataUC(client)

	ws := factory.NewWorkspace()
	_ = accountmongo.NewWorkspace(client).Save(ctx, ws)
	pid := id.NewProjectID()
	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: workspace.IDList{ws.ID()},
		},
	}

	// Create initial metadata as user1
	user1 := accountdomain.NewUserID()
	readme := "readme content"
	license := "MIT"
	topics := []string{"go", "test"}
	starCount := int64(5)
	userID := accountdomain.NewUserID()
	starredBy := []string{userID.String()}
	param := interfaces.CreateProjectMetadataParam{
		ProjectID:   pid,
		WorkspaceID: ws.ID(),
		Readme:      &readme,
		License:     &license,
		Topics:      &topics,
		StarCount:   &starCount,
		StarredBy:   &starredBy,
	}
	meta, err := uc.Create(ctx, param, operator)
	assert.NoError(t, err)
	assert.NotNil(t, meta)

	// Patch star count as user2 (should be allowed)
	user2 := accountdomain.NewUserID()
	newStarCount := int64(2)
	newStarredBy := []string{user1.String(), user2.String()}
	patchParam := interfaces.UpdateProjectMetadataByAnyUserParam{
		ID:        pid,
		StarCount: &newStarCount,
		StarredBy: &newStarredBy,
	}
	patched, err := uc.UpdateProjectMetadataByAnyUser(ctx, patchParam)
	assert.NoError(t, err)
	assert.NotNil(t, patched)
	assert.Equal(t, &newStarCount, patched.StarCount())
	assert.Equal(t, &newStarredBy, patched.StarredBy())

	// Confirm persisted changes
	found, err := uc.FindByProjectID(ctx, pid, operator)
	assert.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, &newStarCount, found.StarCount())
	assert.Equal(t, &newStarredBy, found.StarredBy())

	{
		newPid := id.NewProjectID()
		user3 := accountdomain.NewUserID()
		starCount2 := int64(1)
		starredBy2 := []string{user3.String()}
		patchParam2 := interfaces.UpdateProjectMetadataByAnyUserParam{
			ID:        newPid,
			StarCount: &starCount2,
			StarredBy: &starredBy2,
		}
		// Should fail because record does not exist
		patched2, err := uc.UpdateProjectMetadataByAnyUser(ctx, patchParam2)
		assert.Error(t, err)
		assert.Nil(t, patched2)
	}
}
