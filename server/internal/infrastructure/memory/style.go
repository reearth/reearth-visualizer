package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/rerror"
)

type Style struct {
	lock sync.Mutex
	data map[id.StyleID]scene.Style
	f    repo.SceneFilter
}

func NewStyle() *Style {
	return &Style{
		data: map[id.StyleID]scene.Style{},
	}
}

func NewStyleWith(items ...scene.Style) repo.Style {
	r := NewStyle()
	ctx := context.Background()
	for _, i := range items {
		_ = r.Save(ctx, i)
	}
	return r
}

func (r *Style) Filtered(f repo.SceneFilter) repo.Style {
	return &Style{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Style) FindByID(ctx context.Context, id id.StyleID) (*scene.Style, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res, ok := r.data[id]
	if ok && r.f.CanRead(res.Scene()) {
		return &res, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Style) FindByIDs(ctx context.Context, ids id.StyleIDList) (*scene.StyleList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := scene.StyleList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Scene()) {
			result = append(result, &d)
			continue
		}
		result = append(result, nil)
	}
	return &result, nil
}

func (r *Style) Save(ctx context.Context, l scene.Style) error {
	if !r.f.CanWrite(l.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[l.ID()] = l
	return nil
}

func (r *Style) FindByScene(ctx context.Context, sceneID id.SceneID) (*scene.StyleList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	res := scene.StyleList{}
	for _, l := range r.data {
		l := l
		if l.Scene() == sceneID {
			res = append(res, &l)
		}
	}
	return &res, nil
}

func (r *Style) SaveAll(ctx context.Context, ll scene.StyleList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, l := range ll {
		layer := *l
		if r.f.CanWrite(layer.Scene()) {
			r.data[layer.ID()] = layer
		}
	}
	return nil
}

func (r *Style) Remove(ctx context.Context, id id.StyleID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if l, ok := r.data[id]; ok && r.f.CanWrite(l.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *Style) RemoveAll(ctx context.Context, ids id.StyleIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		if l, ok := r.data[id]; ok && r.f.CanWrite(l.Scene()) {
			delete(r.data, id)
		}
	}
	return nil
}

func (r *Style) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	for lid, p := range r.data {
		if p.Scene() == sceneID {
			delete(r.data, lid)
		}
	}
	return nil
}
