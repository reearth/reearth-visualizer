package interactor

import (
	"context"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/usecasex"
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

	currentTime := time.Now().UTC()
	meta.SetUpdatedAt(&currentTime)
	if err := i.projectMetadataRepo.Save(ctx, meta); err != nil {
		return nil, err
	}

	tx.Commit()
	return meta, nil
}
