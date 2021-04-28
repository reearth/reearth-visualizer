package memory

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/dataset"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/id"
)

type DatasetSchema struct {
	data map[id.DatasetSchemaID]dataset.Schema
}

func NewDatasetSchema() repo.DatasetSchema {
	return &DatasetSchema{
		data: map[id.DatasetSchemaID]dataset.Schema{},
	}
}

func (r *DatasetSchema) FindByID(ctx context.Context, id id.DatasetSchemaID, f []id.SceneID) (*dataset.Schema, error) {
	p, ok := r.data[id]
	if ok {
		return &p, nil
	}
	return nil, err1.ErrNotFound
}

func (r *DatasetSchema) FindByIDs(ctx context.Context, ids []id.DatasetSchemaID, f []id.SceneID) (dataset.SchemaList, error) {
	result := dataset.SchemaList{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			d2 := d
			result = append(result, &d2)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (r *DatasetSchema) FindByScene(ctx context.Context, s id.SceneID, p *usecase.Pagination) (dataset.SchemaList, *usecase.PageInfo, error) {
	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s {
			d2 := d
			result = append(result, &d2)
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
	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s {
			d2 := d
			result = append(result, &d2)
		}
	}
	return result, nil
}

func (r *DatasetSchema) FindAllDynamicByScene(ctx context.Context, s id.SceneID) (dataset.SchemaList, error) {
	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s && d.Dynamic() {
			d2 := d
			result = append(result, &d2)
		}
	}
	return result, nil
}

func (r *DatasetSchema) FindDynamicByID(ctx context.Context, id id.DatasetSchemaID) (*dataset.Schema, error) {
	p, ok := r.data[id]
	if ok && p.Dynamic() {
		return &p, nil
	}
	return nil, err1.ErrNotFound
}

func (r *DatasetSchema) FindBySceneAndSource(ctx context.Context, s id.SceneID, src dataset.Source) (dataset.SchemaList, error) {
	result := dataset.SchemaList{}
	for _, d := range r.data {
		if d.Scene() == s && d.Source() == src {
			d2 := d
			result = append(result, &d2)
		}
	}
	return result, nil
}

func (r *DatasetSchema) Save(ctx context.Context, d *dataset.Schema) error {
	r.data[d.ID()] = *d
	return nil
}

func (r *DatasetSchema) SaveAll(ctx context.Context, dl dataset.SchemaList) error {
	for _, d := range dl {
		r.data[d.ID()] = *d
	}
	return nil
}

func (r *DatasetSchema) Remove(ctx context.Context, id id.DatasetSchemaID) error {
	delete(r.data, id)
	return nil
}

func (r *DatasetSchema) RemoveAll(ctx context.Context, ids []id.DatasetSchemaID) error {
	for _, id := range ids {
		delete(r.data, id)
	}
	return nil
}

func (r *DatasetSchema) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	for did, d := range r.data {
		if d.Scene() == sceneID {
			delete(r.data, did)
		}
	}
	return nil
}
