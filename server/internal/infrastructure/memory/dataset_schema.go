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

type DatasetSchema struct {
	data *util.SyncMap[id.DatasetSchemaID, *dataset.Schema]
	f    repo.SceneFilter
}

func NewDatasetSchema() *DatasetSchema {
	return &DatasetSchema{
		data: util.SyncMapFrom[id.DatasetSchemaID, *dataset.Schema](nil),
	}
}

func (r *DatasetSchema) Filtered(f repo.SceneFilter) repo.DatasetSchema {
	return &DatasetSchema{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *DatasetSchema) FindByID(_ context.Context, id id.DatasetSchemaID) (*dataset.Schema, error) {
	p, ok := r.data.Load(id)
	if ok && r.f.CanRead(p.Scene()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *DatasetSchema) FindByIDs(_ context.Context, ids id.DatasetSchemaIDList) (dataset.SchemaList, error) {
	return r.data.FindAll(func(k id.DatasetSchemaID, v *dataset.Schema) bool {
		return ids.Has(k) && r.f.CanRead(v.Scene())
	}), nil
}

func (r *DatasetSchema) FindByScene(_ context.Context, s id.SceneID, p *usecasex.Pagination) (dataset.SchemaList, *usecasex.PageInfo, error) {
	if !r.f.CanRead(s) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	result := r.data.FindAll(func(_ id.DatasetSchemaID, v *dataset.Schema) bool {
		return v.Scene() == s
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

func (r *DatasetSchema) FindBySceneAll(_ context.Context, s id.SceneID) (dataset.SchemaList, error) {
	if !r.f.CanRead(s) {
		return nil, nil
	}

	return r.data.FindAll(func(_ id.DatasetSchemaID, v *dataset.Schema) bool {
		return v.Scene() == s
	}), nil
}

func (r *DatasetSchema) FindBySceneAndSource(_ context.Context, s id.SceneID, src string) (dataset.SchemaList, error) {
	if !r.f.CanRead(s) {
		return nil, rerror.ErrNotFound
	}

	return r.data.FindAll(func(_ id.DatasetSchemaID, v *dataset.Schema) bool {
		return v.Scene() == s && v.Source() == src
	}), nil
}

func (r *DatasetSchema) CountByScene(_ context.Context, sid id.SceneID) (int, error) {
	return r.data.CountAll(func(k id.DatasetSchemaID, v *dataset.Schema) bool {
		return v.Scene() == sid && r.f.CanRead(v.Scene())
	}), nil
}

func (r *DatasetSchema) Save(_ context.Context, d *dataset.Schema) error {
	if !r.f.CanWrite(d.Scene()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(d.ID(), d)
	return nil
}

func (r *DatasetSchema) SaveAll(_ context.Context, dl dataset.SchemaList) error {
	for _, d := range dl {
		if r.f.CanWrite(d.Scene()) {
			r.data.Store(d.ID(), d)
		}
	}
	return nil
}

func (r *DatasetSchema) Remove(_ context.Context, i id.DatasetSchemaID) error {
	d, _ := r.data.Load(i)
	if d == nil {
		return nil
	}

	if !r.f.CanWrite(d.Scene()) {
		return repo.ErrOperationDenied
	}

	r.data.Delete(d.ID())
	return nil
}

func (r *DatasetSchema) RemoveAll(_ context.Context, ids id.DatasetSchemaIDList) error {
	r.data.Range(func(k id.DatasetSchemaID, v *dataset.Schema) bool {
		if ids.Has(k) && r.f.CanWrite(v.Scene()) {
			r.data.Delete(k)
		}
		return true
	})
	return nil
}

func (r *DatasetSchema) RemoveByScene(_ context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	r.data.Range(func(k id.DatasetSchemaID, v *dataset.Schema) bool {
		if v.Scene() == sceneID {
			r.data.Delete(k)
		}
		return true
	})
	return nil
}
