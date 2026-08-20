package memory

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
)

// importClaim mirrors the shape of a projectimport document in the mongo
// repo (status + updatedat) for ClaimImport's staleness check.
type importClaim struct {
	status    project.ProjectImportStatus
	updatedAt time.Time
}

type ProjectMetadata struct {
	lock         sync.Mutex
	data         map[id.ProjectMetadataID]*project.ProjectMetadata
	importClaims map[id.ProjectID]*importClaim
	f            repo.WorkspaceFilter
}

func NewProjectMetadata() repo.ProjectMetadata {
	return &ProjectMetadata{
		data:         map[id.ProjectMetadataID]*project.ProjectMetadata{},
		importClaims: map[id.ProjectID]*importClaim{},
	}
}

func (r *ProjectMetadata) Filtered(f repo.WorkspaceFilter) repo.ProjectMetadata {
	return &ProjectMetadata{
		// note data is shared between the source repo and mutex cannot work well
		data:         r.data,
		importClaims: r.importClaims,
		f:            r.f.Merge(f),
	}
}

func (r *ProjectMetadata) FindByProjectID(ctx context.Context, id id.ProjectID) (*project.ProjectMetadata, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range r.data {
		if p.Project() == id {
			return p, nil
		}
	}

	return nil, errors.New("not found")
}

func (r *ProjectMetadata) FindByProjectIDList(ctx context.Context, ids id.ProjectIDList) ([]*project.ProjectMetadata, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	var result []*project.ProjectMetadata
	for _, p := range r.data {
		for _, id2 := range ids {
			if p.Project() == id2 {
				result = append(result, p)
				break
			}
		}
	}

	return result, nil
}

func (r *ProjectMetadata) Save(ctx context.Context, p *project.ProjectMetadata) error {
	if !r.f.CanWrite(p.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	updated := time.Now()
	p.SetUpdatedAt(&updated)
	r.data[p.ID()] = p

	if p.ImportStatus() != nil {
		r.importClaims[p.Project()] = &importClaim{status: *p.ImportStatus(), updatedAt: updated}
	}

	return nil
}

// ClaimImport mirrors the mongo repo's atomic claim: it fails if a prior
// attempt already succeeded, or one is currently PROCESSING and not yet
// stale. Otherwise it claims by recording PROCESSING with the current time.
func (r *ProjectMetadata) ClaimImport(ctx context.Context, pid id.ProjectID, staleAfter time.Duration) (bool, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	now := time.Now()
	if existing, ok := r.importClaims[pid]; ok {
		if existing.status == project.ProjectImportStatusSuccess {
			return false, nil
		}
		if existing.status == project.ProjectImportStatusProcessing && now.Sub(existing.updatedAt) < staleAfter {
			return false, nil
		}
	}

	r.importClaims[pid] = &importClaim{status: project.ProjectImportStatusProcessing, updatedAt: now}
	return true, nil
}

func (r *ProjectMetadata) Remove(ctx context.Context, id id.ProjectID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, pm := range r.data {
		if pm.Project() == id {
			delete(r.data, pm.ID())
		}
	}

	return nil
}
