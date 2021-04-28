package memory

import (
	"context"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/project"
)

type Project struct {
	data map[id.ProjectID]*project.Project
}

func NewProject() repo.Project {
	return &Project{
		data: map[id.ProjectID]*project.Project{},
	}
}

func (r *Project) FindByTeam(ctx context.Context, id id.TeamID, p *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error) {
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

func (r *Project) FindByIDs(ctx context.Context, ids []id.ProjectID, filter []id.TeamID) ([]*project.Project, error) {
	result := []*project.Project{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if isTeamIncludes(d.Team(), filter) {
				result = append(result, d)
				continue
			}
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Project) FindByID(ctx context.Context, id id.ProjectID, filter []id.TeamID) (*project.Project, error) {
	p, ok := r.data[id]
	if ok && isTeamIncludes(p.Team(), filter) {
		return p, nil
	}
	return nil, err1.ErrNotFound
}

func (r *Project) FindByPublicName(ctx context.Context, name string) (*project.Project, error) {
	if name == "" {
		return nil, nil
	}
	for _, p := range r.data {
		if p.MatchWithPublicName(name) {
			return p, nil
		}
	}
	return nil, err1.ErrNotFound
}

func (r *Project) CountByTeam(ctx context.Context, team id.TeamID) (c int, err error) {
	for _, p := range r.data {
		if p.Team() == team {
			c++
		}
	}
	return
}

func (r *Project) Save(ctx context.Context, p *project.Project) error {
	p.SetUpdatedAt(time.Now())
	r.data[p.ID()] = p
	return nil
}

func (r *Project) Remove(ctx context.Context, projectID id.ProjectID) error {
	for sid := range r.data {
		if sid == projectID {
			delete(r.data, sid)
		}
	}
	return nil
}
