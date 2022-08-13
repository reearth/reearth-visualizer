package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type Layer struct {
	lock sync.Mutex
	data map[id.LayerID]layer.Layer
	f    repo.SceneFilter
}

func NewLayer() repo.Layer {
	return &Layer{
		data: map[id.LayerID]layer.Layer{},
	}
}

func NewLayerWith(items ...layer.Layer) repo.Layer {
	r := NewLayer()
	for _, i := range items {
		_ = r.Save(nil, i)
	}
	return r
}

func (r *Layer) Filtered(f repo.SceneFilter) repo.Layer {
	return &Layer{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Layer) FindByID(ctx context.Context, id id.LayerID) (layer.Layer, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res, ok := r.data[id]
	if ok && r.f.CanRead(res.Scene()) {
		return res, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Layer) FindByIDs(ctx context.Context, ids id.LayerIDList) (layer.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := layer.List{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Scene()) {
			result = append(result, &d)
			continue
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Layer) FindGroupByIDs(ctx context.Context, ids id.LayerIDList) (layer.GroupList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := layer.GroupList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if lg := layer.GroupFromLayer(d); lg != nil && r.f.CanRead(lg.Scene()) {
				result = append(result, lg)
				continue
			}
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *Layer) FindItemByIDs(ctx context.Context, ids id.LayerIDList) (layer.ItemList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := layer.ItemList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if li := layer.ItemFromLayer(d); li != nil && r.f.CanRead(li.Scene()) {
				result = append(result, li)
				continue
			}
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *Layer) FindItemByID(ctx context.Context, id id.LayerID) (*layer.Item, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if !ok {
		return &layer.Item{}, nil
	}
	if li := layer.ItemFromLayer(d); li != nil && r.f.CanRead(li.Scene()) {
		return li, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Layer) FindGroupByID(ctx context.Context, id id.LayerID) (*layer.Group, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if !ok {
		return &layer.Group{}, nil
	}
	if lg := layer.GroupFromLayer(d); lg != nil && r.f.CanRead(lg.Scene()) {
		return lg, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Layer) FindGroupBySceneAndLinkedDatasetSchema(ctx context.Context, s id.SceneID, ds id.DatasetSchemaID) (layer.GroupList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := layer.GroupList{}
	for _, l := range r.data {
		if l.Scene() != s {
			continue
		}
		if lg := layer.ToLayerGroup(l); lg != nil && r.f.CanRead(lg.Scene()) {
			if dsid := lg.LinkedDatasetSchema(); dsid != nil && *dsid == ds {
				result = append(result, lg)
			}
		}
	}
	return result, nil
}

func (r *Layer) FindParentsByIDs(_ context.Context, ids id.LayerIDList) (layer.GroupList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res := layer.GroupList{}
	for _, l := range r.data {
		if lg := layer.ToLayerGroup(l); lg != nil && r.f.CanRead(l.Scene()) {
			for _, cl := range lg.Layers().Layers() {
				if ids.Has(cl) {
					res = append(res, lg)
				}
			}
		}
	}

	return res, nil
}

func (r *Layer) FindByPluginAndExtension(_ context.Context, pid id.PluginID, eid *id.PluginExtensionID) (layer.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res := layer.List{}
	for _, l := range r.data {
		l := l
		if r.f.CanRead(l.Scene()) && l.Plugin() != nil && l.Plugin().Equal(pid) {
			e := l.Extension()
			if eid == nil || e != nil && *e == *eid {
				res = append(res, &l)
			}
		}
	}

	return res, nil
}

func (r *Layer) FindByPluginAndExtensionOfBlocks(_ context.Context, pid id.PluginID, eid *id.PluginExtensionID) (layer.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res := layer.List{}
	for _, l := range r.data {
		l := l
		if !r.f.CanRead(l.Scene()) || len(l.Infobox().FieldsByPlugin(pid, eid)) == 0 {
			continue
		}
		res = append(res, &l)
	}

	return res, nil
}

func (r *Layer) FindByProperty(ctx context.Context, id id.PropertyID) (layer.Layer, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, l := range r.data {
		if !r.f.CanRead(l.Scene()) {
			continue
		}
		if pid := l.Property(); pid != nil && *pid == id {
			return l, nil
		}
		if pid := l.Infobox().PropertyRef(); pid != nil && *pid == id {
			return l, nil
		}
		for _, f := range l.Infobox().Fields() {
			if f.Property() == id {
				return l, nil
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Layer) FindParentByID(ctx context.Context, id id.LayerID) (*layer.Group, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, l := range r.data {
		if lg := layer.ToLayerGroup(l); lg != nil && r.f.CanRead(l.Scene()) {
			for _, cl := range lg.Layers().Layers() {
				if cl == id {
					return lg, nil
				}
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *Layer) FindByScene(ctx context.Context, sceneID id.SceneID) (layer.List, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	res := layer.List{}
	for _, l := range r.data {
		l := l
		if l.Scene() == sceneID {
			res = append(res, &l)
		}
	}
	return res, nil
}

func (r *Layer) FindAllByDatasetSchema(ctx context.Context, datasetSchemaID id.DatasetSchemaID) (layer.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res := layer.List{}
	for _, l := range r.data {
		l := l
		if d := layer.ToLayerGroup(l).LinkedDatasetSchema(); d != nil && *d == datasetSchemaID && r.f.CanRead(l.Scene()) {
			res = append(res, &l)
		}
	}
	return res, nil
}

func (r *Layer) FindByTag(ctx context.Context, tagID id.TagID) (layer.List, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	var res layer.List
	for _, l := range r.data {
		l := l
		if l.Tags().Has(tagID) && r.f.CanRead(l.Scene()) {
			res = append(res, &l)
		}
	}

	return res, nil
}

func (r *Layer) Save(ctx context.Context, l layer.Layer) error {
	if !r.f.CanWrite(l.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[l.ID()] = l
	return nil
}

func (r *Layer) SaveAll(ctx context.Context, ll layer.List) error {
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

func (r *Layer) UpdatePlugin(ctx context.Context, old id.PluginID, new id.PluginID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, l := range r.data {
		p := l.Plugin()
		if p != nil && p.Equal(old) && r.f.CanWrite(l.Scene()) {
			l.SetPlugin(&new)
			r.data[l.ID()] = l
		}
	}
	return nil
}

func (r *Layer) Remove(ctx context.Context, id id.LayerID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if l, ok := r.data[id]; ok && l != nil && r.f.CanWrite(l.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *Layer) RemoveAll(ctx context.Context, ids id.LayerIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		if l, ok := r.data[id]; ok && l != nil && r.f.CanWrite(l.Scene()) {
			delete(r.data, id)
		}
	}
	return nil
}

func (r *Layer) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
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
