package memory

import (
	"context"
	"sync"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/project"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type Project struct {
	lock sync.Mutex
	data map[id.ProjectID]*project.Project
	f    repo.TeamFilter
}

func NewProject() repo.Project {
	return &Project{
		data: map[id.ProjectID]*project.Project{},
	}
}

func (r *Project) Filtered(f repo.TeamFilter) repo.Project {
	return &Project{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Project) FindByTeam(ctx context.Context, id id.TeamID, p *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*project.Project{}
	for _, d := range r.data {
		if d.Team() == id {
			result = append(result, d)
		}
	}

	var startCursor, endCursor *usecase.Cursor
	if len(result) > 0 {
		_startCursor := usecase.Cursor(result[0].ID().String())
		_endCursor := usecase.Cursor(result[len(result)-1].ID().String())
		startCursor = &_startCursor
		endCursor = &_endCursor
	}

	return result, usecase.NewPageInfo(
		len(r.data),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *Project) FindByIDs(ctx context.Context, ids []id.ProjectID) ([]*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*project.Project{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Team()) {
			result = append(result, d)
			continue
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Project) FindByID(ctx context.Context, id id.ProjectID) (*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanRead(p.Team()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if name == "" {
		return nil, nil
	}
	for _, p := range r.data {
		if p.MatchWithPublicName(name) && r.f.CanRead(p.Team()) {
			return p, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Project) CountByTeam(ctx context.Context, team id.TeamID) (c int, err error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, p := range r.data {
		if p.Team() == team && r.f.CanRead(p.Team()) {
			c++
		}
	}
	return
}

func (r *Project) Save(ctx context.Context, p *project.Project) error {
	if !r.f.CanWrite(p.Team()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	p.SetUpdatedAt(time.Now())
	r.data[p.ID()] = p
	return nil
}

func (r *Project) Remove(ctx context.Context, id id.ProjectID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanRead(p.Team()) {
		delete(r.data, id)
	}
	return nil
}
