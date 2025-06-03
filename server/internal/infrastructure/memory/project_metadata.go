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

type ProjectMetadata struct {
	lock sync.Mutex
	data map[id.ProjectMetadataID]*project.ProjectMetadata
	f    repo.WorkspaceFilter
}

func NewProjectMetadata() repo.ProjectMetadata {
	return &ProjectMetadata{
		data: map[id.ProjectMetadataID]*project.ProjectMetadata{},
	}
}

func (r *ProjectMetadata) Filtered(f repo.WorkspaceFilter) repo.ProjectMetadata {
	return &ProjectMetadata{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
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
	return nil
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
