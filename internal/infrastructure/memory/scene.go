package memory

import (
	"context"
	"sync"
	"time"

	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/scene"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

type Scene struct {
	lock sync.Mutex
	data map[id.SceneID]scene.Scene
}

func NewScene() repo.Scene {
	return &Scene{
		data: map[id.SceneID]scene.Scene{},
	}
}

func (r *Scene) FindByID(ctx context.Context, id id.SceneID, f []id.TeamID) (*scene.Scene, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	s, ok := r.data[id]
	if ok && isTeamIncludes(s.Team(), f) {
		return &s, nil
	}
	return nil, err1.ErrNotFound
}

func (r *Scene) FindByIDs(ctx context.Context, ids []id.SceneID, f []id.TeamID) ([]*scene.Scene, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*scene.Scene{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if isTeamIncludes(d.Team(), f) {
				result = append(result, &d)
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
			return &d, nil
		}
	}
	return nil, err1.ErrNotFound
}

func (r *Scene) FindIDsByTeam(ctx context.Context, teams []id.TeamID) ([]id.SceneID, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []id.SceneID{}
	for _, d := range r.data {
		if isTeamIncludes(d.Team(), teams) {
			result = append(result, d.ID())
		}
	}
	return result, nil
}

func (r *Scene) HasSceneTeam(ctx context.Context, id id.SceneID, teams []id.TeamID) (bool, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	s, ok := r.data[id]
	if !ok {
		return false, err1.ErrNotFound
	}
	return s.IsTeamIncluded(teams), nil
}

func (r *Scene) HasScenesTeam(ctx context.Context, id []id.SceneID, teams []id.TeamID) ([]bool, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if id == nil {
		return nil, nil
	}
	if len(teams) == 0 {
		return make([]bool, len(id)), nil
	}
	res := make([]bool, 0, len(id))
	for _, i := range id {
		if teams == nil {
			res = append(res, false)
			continue
		}
		s, ok := r.data[i]
		if !ok {
			res = append(res, false)
			continue
		}
		res = append(res, s.IsTeamIncluded(teams))
	}
	return res, nil
}

func (r *Scene) Save(ctx context.Context, s *scene.Scene) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	s.SetUpdatedAt(time.Now())
	r.data[s.ID()] = *s
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
