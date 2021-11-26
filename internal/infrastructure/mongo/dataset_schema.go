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
}

func NewDatasetSchema(client *mongodoc.Client) repo.DatasetSchema {
	r := &datasetSchemaRepo{client: client.WithCollection("datasetSchema")}
	r.init()
	return r
}

func (r *datasetSchemaRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "datasetSchema", i)
	}
}

func (r *datasetSchemaRepo) FindByID(ctx context.Context, id2 id.DatasetSchemaID, f []id.SceneID) (*dataset.Schema, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: id.ID(id2).String()},
	}, f)
	return r.findOne(ctx, filter)
}

func (r *datasetSchemaRepo) FindByIDs(ctx context.Context, ids []id.DatasetSchemaID, f []id.SceneID) (dataset.SchemaList, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.DatasetSchemaIDToKeys(ids)},
		}},
	}, f)
	dst := make([]*dataset.Schema, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterDatasetSchemas(ids, res), nil
}

func (r *datasetSchemaRepo) FindByScene(ctx context.Context, sceneID id.SceneID, pagination *usecase.Pagination) (dataset.SchemaList, *usecase.PageInfo, error) {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	return r.paginate(ctx, filter, pagination)
}

func (r *datasetSchemaRepo) FindBySceneAll(ctx context.Context, sceneID id.SceneID) (dataset.SchemaList, error) {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	return r.find(ctx, nil, filter)
}

func (r *datasetSchemaRepo) FindDynamicByID(ctx context.Context, sid id.DatasetSchemaID) (*dataset.Schema, error) {
	filter := bson.D{
		{Key: "id", Value: id.ID(sid).String()},
		{Key: "dynamic", Value: true},
	}
	return r.findOne(ctx, filter)
}

func (r *datasetSchemaRepo) FindAllDynamicByScene(ctx context.Context, sceneID id.SceneID) (dataset.SchemaList, error) {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
		{Key: "dynamic", Value: true},
	}
	return r.find(ctx, nil, filter)
}

func (r *datasetSchemaRepo) FindBySceneAndSource(ctx context.Context, sceneID id.SceneID, source string) (dataset.SchemaList, error) {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
		{Key: "source", Value: string(source)},
	}
	return r.find(ctx, nil, filter)
}

func (r *datasetSchemaRepo) Save(ctx context.Context, datasetSchema *dataset.Schema) error {
	doc, id := mongodoc.NewDatasetSchema(datasetSchema)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *datasetSchemaRepo) SaveAll(ctx context.Context, datasetSchemas dataset.SchemaList) error {
	if datasetSchemas == nil || len(datasetSchemas) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewDatasetSchemas(datasetSchemas)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *datasetSchemaRepo) Remove(ctx context.Context, datasetSchemaID id.DatasetSchemaID) error {
	return r.client.RemoveOne(ctx, datasetSchemaID.String())
}

func (r *datasetSchemaRepo) RemoveAll(ctx context.Context, ids []id.DatasetSchemaID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, id.DatasetSchemaIDToKeys(ids))
}

func (r *datasetSchemaRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *datasetSchemaRepo) find(ctx context.Context, dst []*dataset.Schema, filter bson.D) ([]*dataset.Schema, error) {
	c := mongodoc.DatasetSchemaConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *datasetSchemaRepo) findOne(ctx context.Context, filter bson.D) (*dataset.Schema, error) {
	dst := make([]*dataset.Schema, 0, 1)
	c := mongodoc.DatasetSchemaConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *datasetSchemaRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) ([]*dataset.Schema, *usecase.PageInfo, error) {
	var c mongodoc.DatasetSchemaConsumer
	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
	if err2 != nil {
		return nil, nil, rerror.ErrInternalBy(err2)
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

func (*datasetSchemaRepo) sceneFilter(filter bson.D, scenes []id.SceneID) bson.D {
	if scenes == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "scene",
		Value: bson.D{{Key: "$in", Value: id.SceneIDToKeys(scenes)}},
	})
	return filter
}
