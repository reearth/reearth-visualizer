package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearthx/rerror"
)

type NLSLayer struct {
	lock sync.Mutex
	data map[id.NLSLayerID]nlslayer.NLSLayer
	f    repo.SceneFilter
}

func NewNLSLayer() *NLSLayer {
	return &NLSLayer{
		data: map[id.NLSLayerID]nlslayer.NLSLayer{},
	}
}

func NewNLSLayerWith(items ...nlslayer.NLSLayer) repo.NLSLayer {
	r := NewNLSLayer()
	ctx := context.Background()
	for _, i := range items {
		_ = r.Save(ctx, i)
	}
	return r
}

func (r *NLSLayer) Filtered(f repo.SceneFilter) repo.NLSLayer {
	return &NLSLayer{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *NLSLayer) FindByID(ctx context.Context, id id.NLSLayerID) (nlslayer.NLSLayer, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res, ok := r.data[id]
	if ok && r.f.CanRead(res.Scene()) {
		return res, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *NLSLayer) FindByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := nlslayer.NLSLayerList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Scene()) {
			result = append(result, &d)
			continue
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *NLSLayer) FindNLSLayerGroupByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerGroupList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := nlslayer.NLSLayerGroupList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if lg := nlslayer.NLSLayerGroupFromLayer(d); lg != nil && r.f.CanRead(lg.Scene()) {
				result = append(result, lg)
				continue
			}
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *NLSLayer) FindNLSLayerGroupByID(ctx context.Context, id id.NLSLayerID) (*nlslayer.NLSLayerGroup, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if !ok {
		return &nlslayer.NLSLayerGroup{}, nil
	}
	if lg := nlslayer.NLSLayerGroupFromLayer(d); lg != nil && r.f.CanRead(lg.Scene()) {
		return lg, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *NLSLayer) FindNLSLayerSimpleByIDs(ctx context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerSimpleList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := nlslayer.NLSLayerSimpleList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			if li := nlslayer.NLSLayerSimpleFromLayer(d); li != nil && r.f.CanRead(li.Scene()) {
				result = append(result, li)
				continue
			}
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *NLSLayer) FindNLSLayerSimpleByID(ctx context.Context, id id.NLSLayerID) (*nlslayer.NLSLayerSimple, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if !ok {
		return &nlslayer.NLSLayerSimple{}, nil
	}
	if li := nlslayer.NLSLayerSimpleFromLayer(d); li != nil && r.f.CanRead(li.Scene()) {
		return li, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *NLSLayer) Save(ctx context.Context, l nlslayer.NLSLayer) error {
	if !r.f.CanWrite(l.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[l.ID()] = l
	return nil
}

func (r *NLSLayer) FindParentsByIDs(_ context.Context, ids id.NLSLayerIDList) (nlslayer.NLSLayerGroupList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	res := nlslayer.NLSLayerGroupList{}
	for _, l := range r.data {
		if lg := nlslayer.ToNLSLayerGroup(l); lg != nil && r.f.CanRead(l.Scene()) {
			for _, cl := range lg.Children().Layers() {
				if ids.Has(cl) {
					res = append(res, lg)
				}
			}
		}
	}

	return res, nil
}

func (r *NLSLayer) FindParentByID(ctx context.Context, id id.NLSLayerID) (*nlslayer.NLSLayerGroup, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, l := range r.data {
		if lg := nlslayer.ToNLSLayerGroup(l); lg != nil && r.f.CanRead(l.Scene()) {
			for _, cl := range lg.Children().Layers() {
				if cl == id {
					return lg, nil
				}
			}
		}
	}
	return nil, rerror.ErrNotFound
}

func (r *NLSLayer) FindByScene(ctx context.Context, sceneID id.SceneID) (nlslayer.NLSLayerList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	res := nlslayer.NLSLayerList{}
	for _, l := range r.data {
		l := l
		if l.Scene() == sceneID {
			res = append(res, &l)
		}
	}
	return res, nil
}

func (r *NLSLayer) SaveAll(ctx context.Context, ll nlslayer.NLSLayerList) error {
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

func (r *NLSLayer) Remove(ctx context.Context, id id.NLSLayerID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if l, ok := r.data[id]; ok && l != nil && r.f.CanWrite(l.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *NLSLayer) RemoveAll(ctx context.Context, ids id.NLSLayerIDList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		if l, ok := r.data[id]; ok && l != nil && r.f.CanWrite(l.Scene()) {
			delete(r.data, id)
		}
	}
	return nil
}

func (r *NLSLayer) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
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
