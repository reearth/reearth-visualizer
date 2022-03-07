package memory

import (
	"context"
	"sync"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type Scene struct {
	lock sync.Mutex
	data map[id.SceneID]*scene.Scene
}

func NewScene() repo.Scene {
	return &Scene{
		data: map[id.SceneID]*scene.Scene{},
	}
}

func (r *Scene) FindByID(ctx context.Context, id id.SceneID, f []id.TeamID) (*scene.Scene, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	s, ok := r.data[id]
	if ok && isTeamIncludes(s.Team(), f) {
		return s, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Scene) FindByIDs(ctx context.Context, ids []id.SceneID, f []id.TeamID) (scene.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := scene.List{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if isTeamIncludes(d.Team(), f) {
				result = append(result, d)
				continue
			}
		}
		result = append(result, nil)

	}
	return result, nil
}

func (r *Scene) FindByProject(ctx context.Context, id id.ProjectID, f []id.TeamID) (*scene.Scene, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, d := range r.data {
		if d.Project() == id && isTeamIncludes(d.Team(), f) {
			return d, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Scene) FindByTeam(ctx context.Context, teams ...id.TeamID) (scene.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := scene.List{}
	for _, d := range r.data {
		if isTeamIncludes(d.Team(), teams) {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *Scene) Save(ctx context.Context, s *scene.Scene) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	s.SetUpdatedAt(time.Now())
	r.data[s.ID()] = s
	return nil
}

func (r *Scene) Remove(ctx context.Context, sceneID id.SceneID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for sid := range r.data {
		if sid == sceneID {
			delete(r.data, sid)
		}
	}
	return nil
}
