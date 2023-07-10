package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/exp/slices"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

var (
	datasetSchemaIndexes       = []string{"scene"}
	datasetSchemaUniqueIndexes = []string{"id"}
)

type DatasetSchema struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewDatasetSchema(client *mongox.Client) *DatasetSchema {
	return &DatasetSchema{
		client: client.WithCollection("datasetSchema"),
	}
}

func (r *DatasetSchema) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, datasetSchemaIndexes, datasetSchemaUniqueIndexes)
}

func (r *DatasetSchema) Filtered(f repo.SceneFilter) repo.DatasetSchema {
	return &DatasetSchema{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *DatasetSchema) FindByID(ctx context.Context, id id.DatasetSchemaID) (*dataset.Schema, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *DatasetSchema) FindByIDs(ctx context.Context, ids id.DatasetSchemaIDList) (dataset.SchemaList, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterDatasetSchemas(ids, res), nil
}

func (r *DatasetSchema) FindByScene(ctx context.Context, sceneID id.SceneID, pagination *usecasex.Pagination) (dataset.SchemaList, *usecasex.PageInfo, error) {
	if !r.f.CanRead(sceneID) {
		return nil, usecasex.EmptyPageInfo(), nil
	}
	return r.paginate(ctx, bson.M{
		"scene": sceneID.String(),
	}, pagination)
}

func (r *DatasetSchema) FindBySceneAll(ctx context.Context, sceneID id.SceneID) (dataset.SchemaList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}
	return r.find(ctx, bson.M{
		"scene": sceneID.String(),
	})
}

func (r *DatasetSchema) FindBySceneAndSource(ctx context.Context, sceneID id.SceneID, source string) (dataset.SchemaList, error) {
	if !r.f.CanRead(sceneID) {
		return nil, nil
	}
	return r.find(ctx, bson.M{
		"scene":  sceneID.String(),
		"source": string(source),
	})
}

func (r *DatasetSchema) CountByScene(ctx context.Context, id id.SceneID) (int, error) {
	if r.f.Readable != nil && !slices.Contains(r.f.Readable, id) {
		return 0, nil
	}

	res, err := r.client.Count(ctx, bson.M{
		"scene": id.String(),
	})
	if err != nil {
		return 0, err
	}
	return int(res), nil
}

func (r *DatasetSchema) Save(ctx context.Context, datasetSchema *dataset.Schema) error {
	if !r.f.CanWrite(datasetSchema.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewDatasetSchema(datasetSchema)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *DatasetSchema) SaveAll(ctx context.Context, datasetSchemas dataset.SchemaList) error {
	if len(datasetSchemas) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewDatasetSchemas(datasetSchemas, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *DatasetSchema) Remove(ctx context.Context, id id.DatasetSchemaID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *DatasetSchema) RemoveAll(ctx context.Context, ids id.DatasetSchemaIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *DatasetSchema) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	if _, err := r.client.Client().DeleteMany(ctx, bson.M{
		"scene": sceneID.String(),
	}); err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	return nil
}

func (r *DatasetSchema) find(ctx context.Context, filter any) ([]*dataset.Schema, error) {
	c := mongodoc.NewDatasetSchemaConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *DatasetSchema) findOne(ctx context.Context, filter any) (*dataset.Schema, error) {
	c := mongodoc.NewDatasetSchemaConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *DatasetSchema) paginate(ctx context.Context, filter bson.M, pagination *usecasex.Pagination) ([]*dataset.Schema, *usecasex.PageInfo, error) {
	c := mongodoc.NewDatasetSchemaConsumer(r.f.Readable)
	pageInfo, err := r.client.Paginate(ctx, filter, nil, pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	return c.Result, pageInfo, nil
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

// func (r *DatasetSchema) readFilter(filter any) any {
// 	return applySceneFilter(filter, r.f.Readable)
// }

func (r *DatasetSchema) writeFilter(filter any) any {
	return applySceneFilter(filter, r.f.Writable)
}
