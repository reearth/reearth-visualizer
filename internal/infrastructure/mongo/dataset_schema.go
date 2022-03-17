package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type datasetSchemaRepo struct {
	client *mongodoc.ClientCollection
	f      repo.SceneFilter
}

func NewDatasetSchema(client *mongodoc.Client) repo.DatasetSchema {
	r := &datasetSchemaRepo{client: client.WithCollection("datasetSchema")}
	r.init()
	return r
}

func (r *datasetSchemaRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "datasetSchema", i)
	}
}

func (r *datasetSchemaRepo) Filtered(f repo.SceneFilter) repo.DatasetSchema {
	return &datasetSchemaRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *datasetSchemaRepo) FindByID(ctx context.Context, id id.DatasetSchemaID) (*dataset.Schema, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *datasetSchemaRepo) FindByIDs(ctx context.Context, ids []id.DatasetSchemaID) (dataset.SchemaList, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.DatasetSchemaIDsToStrings(ids),
		},
	}
	dst := make([]*dataset.Schema, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterDatasetSchemas(ids, res), nil
}

func (r *datasetSchemaRepo) FindByScene(ctx context.Context, sceneID id.SceneID, pagination *usecase.Pagination) (dataset.SchemaList, *usecase.PageInfo, error) {
	if !r.f.CanRead(sceneID) {
		return nil, usecase.EmptyPageInfo(), nil
	}
	return r.paginate(ctx, bson.M{
		"scene": sceneID.String(),
	}, pagination)
}

func (r *datasetSchemaRepo) FindBySceneAll(ctx context.Context, sceneID id.SceneID) (dataset.SchemaList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}
	return r.find(ctx, nil, bson.M{
		"scene": sceneID.String(),
	})
}

func (r *datasetSchemaRepo) FindDynamicByID(ctx context.Context, sid id.DatasetSchemaID) (*dataset.Schema, error) {
	return r.findOne(ctx, bson.M{
		"id":      id.ID(sid).String(),
		"dynamic": true,
	})
}

func (r *datasetSchemaRepo) FindAllDynamicByScene(ctx context.Context, sceneID id.SceneID) (dataset.SchemaList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}
	return r.find(ctx, nil, bson.M{
		"scene":   sceneID.String(),
		"dynamic": true,
	})
}

func (r *datasetSchemaRepo) FindBySceneAndSource(ctx context.Context, sceneID id.SceneID, source string) (dataset.SchemaList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}
	return r.find(ctx, nil, bson.M{
		"scene":  sceneID.String(),
		"source": string(source),
	})
}

func (r *datasetSchemaRepo) Save(ctx context.Context, datasetSchema *dataset.Schema) error {
	if !r.f.CanWrite(datasetSchema.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewDatasetSchema(datasetSchema)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *datasetSchemaRepo) SaveAll(ctx context.Context, datasetSchemas dataset.SchemaList) error {
	if datasetSchemas == nil || len(datasetSchemas) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewDatasetSchemas(datasetSchemas, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *datasetSchemaRepo) Remove(ctx context.Context, id id.DatasetSchemaID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *datasetSchemaRepo) RemoveAll(ctx context.Context, ids []id.DatasetSchemaID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": id.DatasetSchemaIDsToStrings(ids)},
	}))
}

func (r *datasetSchemaRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	if _, err := r.client.Collection().DeleteMany(ctx, bson.M{
		"scene": sceneID.String(),
	}); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *datasetSchemaRepo) find(ctx context.Context, dst []*dataset.Schema, filter interface{}) ([]*dataset.Schema, error) {
	c := mongodoc.DatasetSchemaConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *datasetSchemaRepo) findOne(ctx context.Context, filter interface{}) (*dataset.Schema, error) {
	dst := make([]*dataset.Schema, 0, 1)
	c := mongodoc.DatasetSchemaConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *datasetSchemaRepo) paginate(ctx context.Context, filter bson.M, pagination *usecase.Pagination) ([]*dataset.Schema, *usecase.PageInfo, error) {
	var c mongodoc.DatasetSchemaConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), nil, pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

func filterDatasetSchemas(ids []id.DatasetSchemaID, rows []*dataset.Schema) []*dataset.Schema {
	res := make([]*dataset.Schema, 0, len(ids))
	for _, id := range ids {
		var r2 *dataset.Schema
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}

func (r *datasetSchemaRepo) readFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Readable)
}

func (r *datasetSchemaRepo) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
