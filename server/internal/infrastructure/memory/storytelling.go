package memory

import (
	"context"
	"sync"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearthx/rerror"
)

type Storytelling struct {
	lock sync.Mutex
	data map[id.StoryID]*storytelling.Story
	f    repo.SceneFilter
}

func NewStorytelling() repo.Storytelling {
	return &Storytelling{
		data: map[id.StoryID]*storytelling.Story{},
	}
}

func (r *Storytelling) Filtered(f repo.SceneFilter) repo.Storytelling {
	return &Storytelling{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Storytelling) FindByID(_ context.Context, sId id.StoryID) (*storytelling.Story, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[sId]; ok && r.f.CanRead(p.Scene()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Storytelling) FindByIDs(_ context.Context, ids id.StoryIDList) (*storytelling.StoryList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := storytelling.StoryList{}
	for _, sId := range ids {
		if d, ok := r.data[sId]; ok && r.f.CanRead(d.Scene()) {
			result = append(result, d)
			continue
		}
		result = append(result, nil)
	}
	return &result, nil
}

func (r *Storytelling) FindByScene(_ context.Context, sId id.SceneID) (*storytelling.StoryList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.f.CanRead(sId) {
		return &storytelling.StoryList{}, nil
	}

	result := storytelling.StoryList{}
	for _, s := range r.data {
		if s.Scene() == sId {
			result = append(result, s)
			continue
		}
		result = append(result, nil)
	}
	return &result, nil
}

func (r *Storytelling) FindByPublicName(ctx context.Context, name string) (*storytelling.Story, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if name == "" {
		return nil, nil
	}
	for _, s := range r.data {
		if s.MatchWithPublicName(name) {
			return s, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Storytelling) Save(_ context.Context, p storytelling.Story) error {
	if !r.f.CanWrite(p.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	p.SetUpdatedAt(time.Now())
	r.data[p.Id()] = &p
	return nil
}

func (r *Storytelling) SaveAll(_ context.Context, sl storytelling.StoryList) error {
	for _, s := range sl {
		if !r.f.CanWrite(s.Scene()) {
			return repo.ErrOperationDenied
		}
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	for _, s := range sl {
		s.SetUpdatedAt(time.Now())
		r.data[s.Id()] = s
	}

	return nil
}

func (r *Storytelling) Remove(_ context.Context, id id.StoryID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if p, ok := r.data[id]; ok && r.f.CanRead(p.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *Storytelling) RemoveAll(_ context.Context, ids id.StoryIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, sId := range ids {
		if p, ok := r.data[sId]; ok && !r.f.CanWrite(p.Scene()) {
			return repo.ErrOperationDenied
		}
	}

	for _, sId := range ids {
		delete(r.data, sId)
	}
	return nil
}

func (r *Storytelling) RemoveByScene(_ context.Context, sId id.SceneID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.f.CanRead(sId) {
		return repo.ErrOperationDenied
	}

	for _, s := range r.data {
		if s.Scene() == sId {
			delete(r.data, s.Id())
		}
	}
	return nil
}
