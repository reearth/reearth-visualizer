package memory

import (
	"context"
	"sync"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/user"
)

type Scene struct {
	lock sync.Mutex
	data map[id.SceneID]*scene.Scene
	f    repo.TeamFilter
}

func NewScene() repo.Scene {
	return &Scene{
		data: map[id.SceneID]*scene.Scene{},
	}
}

func NewSceneWith(items ...*scene.Scene) repo.Scene {
	r := NewScene()
	for _, i := range items {
		_ = r.Save(nil, i)
	}
	return r
}

func (r *Scene) Filtered(f repo.TeamFilter) repo.Scene {
	return &Scene{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Scene) FindByID(ctx context.Context, id id.SceneID) (*scene.Scene, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if s, ok := r.data[id]; ok && r.f.CanRead(s.Team()) {
		return s, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Scene) FindByIDs(ctx context.Context, ids id.SceneIDList) (scene.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := scene.List{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Team()) {
			result = append(result, d)
			continue
		}
		result = append(result, nil)

	}
	return result, nil
}

func (r *Scene) FindByProject(ctx context.Context, id id.ProjectID) (*scene.Scene, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, d := range r.data {
		if d.Project() == id && r.f.CanRead(d.Team()) {
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
		if user.TeamIDList(teams).Has(d.Team()) && r.f.CanRead(d.Team()) {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *Scene) Save(ctx context.Context, s *scene.Scene) error {
	if !r.f.CanWrite(s.Team()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	s.SetUpdatedAt(time.Now())
	r.data[s.ID()] = s
	return nil
}

func (r *Scene) Remove(ctx context.Context, id id.SceneID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if s, ok := r.data[id]; ok && r.f.CanWrite(s.Team()) {
		delete(r.data, id)
	}

	return nil
}
