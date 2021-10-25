package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/pkg/rerror"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/tag"
)

type Tag struct {
	lock sync.Mutex
	data map[id.TagID]tag.Tag
}

func NewTag() repo.Tag {
	return &Tag{
		data: map[id.TagID]tag.Tag{},
	}
}

func (t *Tag) FindByID(ctx context.Context, tagID id.TagID, ids []id.SceneID) (tag.Tag, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	res, ok := t.data[tagID]
	if ok && isSceneIncludes(res.Scene(), ids) {
		return res, nil
	}
	return nil, rerror.ErrNotFound
}

func (t *Tag) FindByIDs(ctx context.Context, tids []id.TagID, ids []id.SceneID) ([]*tag.Tag, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	var res []*tag.Tag
	for _, id := range tids {
		if d, ok := t.data[id]; ok {
			if isSceneIncludes(d.Scene(), ids) {
				res = append(res, &d)
				continue
			}
		}
		res = append(res, nil)
	}
	return res, nil
}

func (t *Tag) FindItemByID(ctx context.Context, tagID id.TagID, ids []id.SceneID) (*tag.Item, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	if d, ok := t.data[tagID]; ok {
		if res := tag.ItemFrom(d); res != nil {
			if isSceneIncludes(res.Scene(), ids) {
				return res, nil
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (t *Tag) FindItemByIDs(ctx context.Context, tagIDs []id.TagID, ids []id.SceneID) ([]*tag.Item, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	var res []*tag.Item
	for _, id := range tagIDs {
		if d, ok := t.data[id]; ok {
			if ti := tag.ItemFrom(d); ti != nil {
				if isSceneIncludes(ti.Scene(), ids) {
					res = append(res, ti)
				}
			}
		}
	}
	return res, nil
}

func (t *Tag) FindGroupByID(ctx context.Context, tagID id.TagID, ids []id.SceneID) (*tag.Group, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	if d, ok := t.data[tagID]; ok {
		if res := tag.GroupFrom(d); res != nil {
			if isSceneIncludes(res.Scene(), ids) {
				return res, nil
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (t *Tag) FindGroupByIDs(ctx context.Context, tagIDs []id.TagID, ids []id.SceneID) ([]*tag.Group, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	var res []*tag.Group
	for _, id := range tagIDs {
		if d, ok := t.data[id]; ok {
			if tg := tag.GroupFrom(d); tg != nil {
				if isSceneIncludes(tg.Scene(), ids) {
					res = append(res, tg)
				}
			}
		}
	}
	return res, nil
}

func (t *Tag) FindByScene(ctx context.Context, sceneID id.SceneID) ([]*tag.Tag, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	var res []*tag.Tag
	for _, tag := range t.data {
		tag := tag
		if tag.Scene() == sceneID {
			res = append(res, &tag)
		}
	}
	return res, nil
}

func (t *Tag) Save(ctx context.Context, tag tag.Tag) error {
	t.lock.Lock()
	defer t.lock.Unlock()

	t.data[tag.ID()] = tag
	return nil
}

func (t *Tag) SaveAll(ctx context.Context, tags []*tag.Tag) error {
	t.lock.Lock()
	defer t.lock.Unlock()

	for _, tagRef := range tags {
		tag := *tagRef
		t.data[tag.ID()] = tag
	}
	return nil
}

func (t *Tag) Remove(ctx context.Context, tagID id.TagID) error {
	t.lock.Lock()
	defer t.lock.Unlock()

	delete(t.data, tagID)
	return nil
}

func (t *Tag) RemoveAll(ctx context.Context, ids []id.TagID) error {
	t.lock.Lock()
	defer t.lock.Unlock()

	for _, tagID := range ids {
		delete(t.data, tagID)
	}
	return nil
}

func (t *Tag) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	t.lock.Lock()
	defer t.lock.Unlock()

	for tid, v := range t.data {
		if v.Scene() == sceneID {
			delete(t.data, tid)
		}
	}
	return nil
}

func (t *Tag) FindGroupByItem(ctx context.Context, tagID id.TagID, s []id.SceneID) (*tag.Group, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	for _, tg := range t.data {
		if res := tag.GroupFrom(tg); res != nil {
			tags := res.Tags()
			for _, item := range tags.Tags() {
				if item == tagID {
					return res, nil
				}
			}
		}
	}

	return nil, rerror.ErrNotFound
}

func (t *Tag) FindGroupByScene(ctx context.Context, sceneID id.SceneID) ([]*tag.Group, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	var res []*tag.Group
	for _, tt := range t.data {
		if group := tag.ToTagGroup(tt); tt.Scene() == sceneID && group != nil {
			res = append(res, group)
		}
	}
	return res, nil
}

func (t *Tag) FindItemByScene(ctx context.Context, sceneID id.SceneID) ([]*tag.Item, error) {
	t.lock.Lock()
	defer t.lock.Unlock()

	var res []*tag.Item
	for _, tt := range t.data {
		if item := tag.ToTagItem(tt); tt.Scene() == sceneID && item != nil {
			res = append(res, item)
		}
	}
	return res, nil
}
