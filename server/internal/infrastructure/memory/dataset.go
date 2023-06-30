package memory

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type Dataset struct {
	data *util.SyncMap[id.DatasetID, *dataset.Dataset]
	f    repo.SceneFilter
}

func NewDataset() *Dataset {
	return &Dataset{
		data: util.SyncMapFrom[id.DatasetID, *dataset.Dataset](nil),
	}
}

func (r *Dataset) Filtered(f repo.SceneFilter) repo.Dataset {
	return &Dataset{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Dataset) FindByID(_ context.Context, id id.DatasetID) (*dataset.Dataset, error) {
	p, ok := r.data.Load(id)
	if ok && r.f.CanRead(p.Scene()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Dataset) FindByIDs(_ context.Context, ids id.DatasetIDList) (dataset.List, error) {
	return r.data.FindAll(func(k id.DatasetID, v *dataset.Dataset) bool {
		return ids.Has(k) && r.f.CanRead(v.Scene())
	}), nil
}

func (r *Dataset) FindBySchema(_ context.Context, s id.DatasetSchemaID, p *usecasex.Pagination) (dataset.List, *usecasex.PageInfo, error) {
	result := r.data.FindAll(func(k id.DatasetID, v *dataset.Dataset) bool {
		return v.Schema() == s && r.f.CanRead(v.Scene())
	})

	var startCursor, endCursor *usecasex.Cursor
	if len(result) > 0 {
		_startCursor := usecasex.Cursor(result[0].ID().String())
		_endCursor := usecasex.Cursor(result[len(result)-1].ID().String())
		startCursor = &_startCursor
		endCursor = &_endCursor
	}

	return result, usecasex.NewPageInfo(
		int64(len(result)),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *Dataset) CountBySchema(_ context.Context, s id.DatasetSchemaID) (int, error) {
	return r.data.CountAll(func(k id.DatasetID, v *dataset.Dataset) bool {
		return v.Schema() == s && r.f.CanRead(v.Scene())
	}), nil
}

func (r *Dataset) FindBySchemaAll(_ context.Context, s id.DatasetSchemaID) (dataset.List, error) {
	return r.data.FindAll(func(k id.DatasetID, v *dataset.Dataset) bool {
		return v.Schema() == s && r.f.CanRead(v.Scene())
	}), nil
}

func (r *Dataset) FindBySchemaAllBy(_ context.Context, s id.DatasetSchemaID, cb func(*dataset.Dataset) error) error {
	items := r.data.FindAll(func(k id.DatasetID, v *dataset.Dataset) bool {
		return v.Schema() == s && r.f.CanRead(v.Scene())
	})
	for _, item := range items {
		if err := cb(item); err != nil {
			return err
		}
	}
	return nil
}

func (r *Dataset) FindGraph(_ context.Context, i id.DatasetID, fields id.DatasetFieldIDList) (dataset.List, error) {
	result := make(dataset.List, 0, len(fields))
	next := i
	for _, nextField := range fields {
		found := false
		r.data.Range(func(k id.DatasetID, v *dataset.Dataset) bool {
			if d, _ := r.data.Load(next); d != nil && r.f.CanRead(d.Scene()) {
				result = append(result, d)
				if f := d.Field(nextField); f != nil {
					if f.Type() == dataset.ValueTypeRef {
						if l := f.Value().ValueRef(); l != nil {
							if did, err := id.DatasetIDFrom(*l); err == nil {
								next = did
								found = true
								return false
							}
						}
					}
				}
			}
			return true
		})
		if !found {
			break
		}
	}

	return result, nil
}

func (r *Dataset) Save(_ context.Context, d *dataset.Dataset) error {
	if !r.f.CanWrite(d.Scene()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(d.ID(), d)
	return nil
}

func (r *Dataset) SaveAll(_ context.Context, dl dataset.List) error {
	for _, d := range dl {
		if r.f.CanWrite(d.Scene()) {
			r.data.Store(d.ID(), d)
		}
	}
	return nil
}

func (r *Dataset) Remove(_ context.Context, i id.DatasetID) error {
	d, _ := r.data.Load(i)
	if d == nil {
		return nil
	}

	if !r.f.CanWrite(d.Scene()) {
		return repo.ErrOperationDenied
	}

	r.data.Delete(i)
	return nil
}

func (r *Dataset) RemoveAll(_ context.Context, ids id.DatasetIDList) error {
	r.data.Range(func(k id.DatasetID, v *dataset.Dataset) bool {
		if ids.Has(k) && r.f.CanWrite(v.Scene()) {
			r.data.Delete(k)
		}
		return true
	})
	return nil
}

func (r *Dataset) RemoveByScene(_ context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}

	r.data.Range(func(k id.DatasetID, v *dataset.Dataset) bool {
		if v.Scene() == sceneID {
			r.data.Delete(k)
		}
		return true
	})
	return nil
}
