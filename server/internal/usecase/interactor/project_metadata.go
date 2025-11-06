package interactor

import (
	"context"
	"errors"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/mongo"
)

type ProjectMetadata struct {
	common
	commonSceneLock
	projectMetadataRepo repo.ProjectMetadata
	transaction         usecasex.Transaction
}

func NewProjectMetadata(r *repo.Container, gr *gateway.Container) interfaces.ProjectMetadata {
	return &ProjectMetadata{
		commonSceneLock:     commonSceneLock{sceneLockRepo: r.SceneLock},
		projectMetadataRepo: r.ProjectMetadata,
		transaction:         r.Transaction,
	}
}

func (i *ProjectMetadata) Fetch(ctx context.Context, ids []id.ProjectID, _ *usecase.Operator) ([]*project.ProjectMetadata, error) {
	// The retrieval is performed together with the project in order to share the sorting logic.
	// This process is currently not in use.
	return nil, nil
}

func (i *ProjectMetadata) Update(ctx context.Context, p interfaces.UpdateProjectMetadataParam, operator *usecase.Operator) (_ *project.ProjectMetadata, err error) {

	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, p.ID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteWorkspace(meta.Workspace(), operator); err != nil {
		return nil, err
	}

	if p.Readme != nil {
		meta.SetReadme(p.Readme)
	}

	if p.License != nil {
		meta.SetLicense(p.License)
	}

	if p.Topics != nil {
		meta.SetTopics(p.Topics)
	}

	if p.StarCount != nil {
		meta.SetStarCount(p.StarCount)
	}

	if p.StarredBy != nil {
		meta.SetStarredBy(p.StarredBy)
	}

	currentTime := time.Now().UTC()
	meta.SetUpdatedAt(&currentTime)
	if err := i.projectMetadataRepo.Save(ctx, meta); err != nil {
		return nil, err
	}

	tx.Commit()
	return meta, nil
}

func (i *ProjectMetadata) Create(ctx context.Context, p interfaces.CreateProjectMetadataParam, operator *usecase.Operator) (_ *project.ProjectMetadata, err error) {

	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	currentTime := time.Now().UTC()
	meta, err := project.NewProjectMetadata().
		NewID().
		Project(p.ProjectID).
		Workspace(p.WorkspaceID).
		Readme(p.Readme).
		License(p.License).
		Topics(p.Topics).
		StarCount(p.StarCount).
		StarredBy(p.StarredBy).
		CreatedAt(&currentTime).
		UpdatedAt(&currentTime).
		Build()
	if err != nil {
		return nil, err
	}

	if err := i.projectMetadataRepo.Save(ctx, meta); err != nil {
		return nil, err
	}

	tx.Commit()
	return meta, nil
}

func (i *ProjectMetadata) FindByProjectID(ctx context.Context, id id.ProjectID, operator *usecase.Operator) (*project.ProjectMetadata, error) {
	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, id)
	if err != mongo.ErrNoDocuments && err != nil {
		return nil, errors.New("failed to find project metadata: " + err.Error())
	}

	if err := i.CanReadWorkspace(meta.Workspace(), operator); err != nil {
		return nil, err
	}
	return meta, nil
}

// PatchStarCountForAnyUser allows any authenticated user to update star count and starredBy fields as we cannot use 'Update' method above
func (i *ProjectMetadata) PatchStarCountForAnyUser(ctx context.Context, p interfaces.UpdateProjectMetadataParam) (*project.ProjectMetadata, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}
	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, p.ID)
	if err != nil {
		return nil, err
	}

	// Only allow updating StarCount and StarredBy
	if p.StarCount != nil {
		meta.SetStarCount(p.StarCount)
	}
	if p.StarredBy != nil {
		meta.SetStarredBy(p.StarredBy)
	}
	now := time.Now().UTC()
	meta.SetUpdatedAt(&now)
	if err := i.projectMetadataRepo.Save(ctx, meta); err != nil {
		return nil, err
	}
	tx.Commit()
	return meta, nil
}

// CreateMetadataByAnyUser allows any authenticated user to create project metadata as we cannot use 'Create' method above
func (i *ProjectMetadata) CreateMetadataByAnyUser(ctx context.Context, p interfaces.CreateProjectMetadataParam) (*project.ProjectMetadata, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}
	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	currentTime := time.Now().UTC()
	meta, err := project.NewProjectMetadata().
		NewID().
		Project(p.ProjectID).
		Workspace(p.WorkspaceID).
		Readme(p.Readme).
		License(p.License).
		Topics(p.Topics).
		StarCount(p.StarCount).
		StarredBy(p.StarredBy).
		CreatedAt(&currentTime).
		UpdatedAt(&currentTime).
		Build()
	if err != nil {
		return nil, err
	}

	if err := i.projectMetadataRepo.Save(ctx, meta); err != nil {
		return nil, err
	}
	tx.Commit()
	return meta, nil
}

func (i *ProjectMetadata) FindByProjectIDAsAnyUsr(ctx context.Context, id id.ProjectID) (*project.ProjectMetadata, error) {
	meta, err := i.projectMetadataRepo.FindByProjectID(ctx, id)
	if err != mongo.ErrNoDocuments && err != nil {
		return nil, errors.New("failed to find project metadata: " + err.Error())
	}

	return meta, nil
}
