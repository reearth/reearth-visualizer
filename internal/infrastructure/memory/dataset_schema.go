package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type DatasetSchema struct {
	lock sync.Mutex
	data map[id.DatasetSchemaID]*dataset.Schema
	f    repo.SceneFilter
}

func NewDatasetSchema() repo.DatasetSchema {
	return &DatasetSchema{
		data: map[id.DatasetSchemaID]*dataset.Schema{},
	}
}

func (r *DatasetSchema) Filtered(f repo.SceneFilter) repo.DatasetSchema {
	return &DatasetSchema{
		// note data is shared between the source repo and mutex cannot work well
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *DatasetSchema) FindByID(ctx context.Context, id id.DatasetSchemaID) (*dataset.Schema, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	p, ok := r.data[id]
	if ok && r.f.CanRead(p.Scene()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *DatasetSchema) FindByIDs(ctx context.Context, ids []id.DatasetSchemaID) (dataset.SchemaList, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := dataset.SchemaList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanRead(d.Scene()) {
			d2 := d
			result = append(result, d2)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *DatasetSchema) FindByScene(ctx context.Context, s id.SceneID, p *usecase.Pagination) (dataset.SchemaList, *usecase.PageInfo, error) {
	if !r.f.CanRead(s) {
		return nil, usecase.EmptyPageInfo(), nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s {
			d2 := d
			result = append(result, d2)
		}
	}

	var startCursor, endCursor *usecase.Cursor
	if len(result) > 0 {
		_startCursor := usecase.Cursor(result[0].ID().String())
		_endCursor := usecase.Cursor(result[len(result)-1].ID().String())
		startCursor = &_startCursor
		endCursor = &_endCursor
	}

	return result, usecase.NewPageInfo(
		len(r.data),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *DatasetSchema) FindBySceneAll(ctx context.Context, s id.SceneID) (dataset.SchemaList, error) {
	if !r.f.CanRead(s) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s && r.f.CanRead(d.Scene()) {
			d2 := d
			result = append(result, d2)
		}
	}
	return result, nil
}

func (r *DatasetSchema) FindAllDynamicByScene(ctx context.Context, s id.SceneID) (dataset.SchemaList, error) {
	if !r.f.CanRead(s) {
		return nil, nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s && d.Dynamic() && r.f.CanRead(d.Scene()) {
			d2 := d
			result = append(result, d2)
		}
	}
	return result, nil
}

func (r *DatasetSchema) FindDynamicByID(ctx context.Context, id id.DatasetSchemaID) (*dataset.Schema, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	p, ok := r.data[id]
	if ok && p.Dynamic() && r.f.CanRead(p.Scene()) {
		return p, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *DatasetSchema) FindBySceneAndSource(ctx context.Context, s id.SceneID, src string) (dataset.SchemaList, error) {
	if !r.f.CanRead(s) {
		return nil, rerror.ErrNotFound
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s && d.Source() == src {
			d2 := d
			result = append(result, d2)
		}
	}
	return result, nil
}

func (r *DatasetSchema) Save(ctx context.Context, d *dataset.Schema) error {
	if !r.f.CanWrite(d.Scene()) {
		return repo.ErrOperationDenied
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[d.ID()] = d
	return nil
}

func (r *DatasetSchema) SaveAll(ctx context.Context, dl dataset.SchemaList) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, d := range dl {
		if r.f.CanWrite(d.Scene()) {
			r.data[d.ID()] = d
		}
	}
	return nil
}

func (r *DatasetSchema) Remove(ctx context.Context, id id.DatasetSchemaID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	if d, ok := r.data[id]; ok && r.f.CanWrite(d.Scene()) {
		delete(r.data, id)
	}
	return nil
}

func (r *DatasetSchema) RemoveAll(ctx context.Context, ids []id.DatasetSchemaID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, id := range ids {
		if d, ok := r.data[id]; ok && r.f.CanWrite(d.Scene()) {
			delete(r.data, id)
		}
	}
	return nil
}

func (r *DatasetSchema) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}

	r.lock.Lock()
	defer r.lock.Unlock()

	for did, d := range r.data {
		if d.Scene() == sceneID {
			delete(r.data, did)
		}
	}
	return nil
}
