package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearthx/rerror"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/tag"
)

type Tag struct {
	lock sync.Mutex
	data tag.Map
	f    repo.SceneFilter
}

func NewTag() *Tag {
	return &Tag{
		data: map[id.TagID]tag.Tag{},
	}
}

func (r *Tag) Filtered(f repo.SceneFilter) repo.Tag {
	return &Tag{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Tag) FindByID(ctx context.Context, tagID id.TagID) (tag.Tag, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if res, ok := r.data[tagID]; ok && r.f.CanRead(res.Scene()) {
		return res, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Tag) FindByIDs(ctx context.Context, tids id.TagIDList) ([]*tag.Tag, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	var res []*tag.Tag
	for _, id := range tids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Scene()) {
			res = append(res, &d)
			continue
		}
		res = append(res, nil)
	}
	return res, nil
}

func (r *Tag) FindByScene(ctx context.Context, sceneID id.SceneID) ([]*tag.Tag, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	return r.data.All().FilterByScene(sceneID).Refs(), nil
}

func (r *Tag) FindItemByID(ctx context.Context, tagID id.TagID) (*tag.Item, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if d, ok := r.data[tagID]; ok {
		if res := tag.ItemFrom(d); res != nil && r.f.CanRead(res.Scene()) {
			return res, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Tag) FindItemByIDs(ctx context.Context, tagIDs id.TagIDList) ([]*tag.Item, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	var res []*tag.Item
	for _, id := range tagIDs {
		if d, ok := r.data[id]; ok {
			if ti := tag.ItemFrom(d); ti != nil && r.f.CanRead(ti.Scene()) {
				res = append(res, ti)
			}
		}
	}
	return res, nil
}

func (r *Tag) FindGroupByID(ctx context.Context, tagID id.TagID) (*tag.Group, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if d, ok := r.data[tagID]; ok {
		if tg := tag.GroupFrom(d); tg != nil && r.f.CanRead(tg.Scene()) {
			return tg, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Tag) FindGroupByIDs(ctx context.Context, tagIDs id.TagIDList) ([]*tag.Group, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	var res []*tag.Group
	for _, id := range tagIDs {
		if d, ok := r.data[id]; ok {
			if tg := tag.GroupFrom(d); tg != nil && r.f.CanRead(tg.Scene()) {
				res = append(res, tg)
			}
		}
	}
	return res, nil
}

func (r *Tag) FindRootsByScene(ctx context.Context, sceneID id.SceneID) ([]*tag.Tag, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	return r.data.All().FilterByScene(sceneID).Roots().Refs(), nil
}

func (r *Tag) FindGroupByItem(ctx context.Context, tagID id.TagID) (*tag.Group, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, tg := range r.data {
		if res := tag.GroupFrom(tg); res != nil {
			for _, item := range res.Tags() {
				if item == tagID {
					return res, nil
				}
			}
		}
	}

	return nil, rerror.ErrNotFound
}

func (r *Tag) Save(ctx context.Context, tag tag.Tag) error {
	if !r.f.CanWrite(tag.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[tag.ID()] = tag
	return nil
}

func (r *Tag) SaveAll(ctx context.Context, tags []*tag.Tag) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, tagRef := range tags {
		tag := *tagRef
		if r.f.CanWrite(tag.Scene()) {
			r.data[tag.ID()] = tag
		}
	}
	return nil
}

func (r *Tag) Remove(ctx context.Context, id id.TagID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if t, ok := r.data[id]; ok && r.f.CanWrite(t.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *Tag) RemoveAll(ctx context.Context, ids id.TagIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		if t, ok := r.data[id]; ok && r.f.CanWrite(t.Scene()) {
			delete(r.data, id)
		}
	}
	return nil
}

func (r *Tag) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	for tid, v := range r.data {
		if v.Scene() == sceneID {
			delete(r.data, tid)
		}
	}
	return nil
}
