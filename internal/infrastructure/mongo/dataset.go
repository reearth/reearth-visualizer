package mongo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

type datasetRepo struct {
	client *mongodoc.ClientCollection
	f      repo.SceneFilter
}

func NewDataset(client *mongodoc.Client) repo.Dataset {
	r := &datasetRepo{client: client.WithCollection("dataset")}
	r.init()
	return r
}

func (r *datasetRepo) Filtered(f repo.SceneFilter) repo.Dataset {
	return &datasetRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *datasetRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene", "schema"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "dataset", i)
	}
}

func (r *datasetRepo) FindByID(ctx context.Context, id id.DatasetID) (*dataset.Dataset, error) {
	return r.findOne(ctx, bson.M{"id": id.String()})
}

func (r *datasetRepo) FindByIDs(ctx context.Context, ids []id.DatasetID) (dataset.List, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.DatasetIDsToStrings(ids),
		},
	}
	dst := make([]*dataset.Dataset, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterDatasets(ids, res), nil
}

func (r *datasetRepo) FindBySchema(ctx context.Context, schemaID id.DatasetSchemaID, pagination *usecase.Pagination) (dataset.List, *usecase.PageInfo, error) {
	return r.paginate(ctx, bson.M{
		"schema": id.ID(schemaID).String(),
	}, pagination)
}

func (r *datasetRepo) FindBySchemaAll(ctx context.Context, schemaID id.DatasetSchemaID) (dataset.List, error) {
	return r.find(ctx, nil, bson.M{
		"schema": id.ID(schemaID).String(),
	})
}

func (r *datasetRepo) FindGraph(ctx context.Context, did id.DatasetID, fields []id.DatasetSchemaFieldID) (dataset.List, error) {
	if len(fields) == 0 {
		d, err := r.FindByID(ctx, did)
		if err != nil {
			return nil, err
		}
		return dataset.List{d}, nil
	}

	fieldsstr := id.DatasetSchemaFieldIDsToStrings(fields)
	firstField := fieldsstr[0]

	aggfilter := bson.D{}
	if r.f.Readable != nil {
		aggfilter = append(aggfilter, bson.E{Key: "$in", Value: []interface{}{
			"$$g.scene",
			id.SceneIDsToStrings(r.f.Readable),
		}})
	}

	pipeline := bson.D{
		{Key: "$match", Value: r.readFilter(bson.M{
			"id":        did.String(),
			"fields.id": firstField,
		})},
		{Key: "$limit", Value: 1},
		{Key: "$addFields", Value: bson.D{
			{Key: "field", Value: bson.D{
				{Key: "$arrayElemAt", Value: []interface{}{
					bson.D{{Key: "$filter", Value: bson.D{
						{Key: "input", Value: "$fields"},
						{Key: "as", Value: "f"},
						{Key: "cond", Value: bson.D{
							{Key: "$and", Value: []bson.D{
								{{Key: "$eq", Value: []string{"$$f.id", firstField}}},
								{{Key: "$eq", Value: []string{"$$f.type", "ref"}}},
							}},
						}},
					}}},
					0,
				}},
			}},
		}},
		{Key: "$graphLookup", Value: bson.D{
			{Key: "from", Value: "dataset"},
			{Key: "startWith", Value: "$field.value"},
			{Key: "connectFromField", Value: "fields.value"},
			{Key: "connectToField", Value: "id"},
			{Key: "depthField", Value: "depth"},
			{Key: "as", Value: "graph"},
			{Key: "restrictSearchWithMatch", Value: r.readFilter(bson.M{})},
		}},
		{Key: "$addFields", Value: bson.D{
			{Key: "firstGraph", Value: bson.D{
				{Key: "$slice", Value: []interface{}{
					bson.D{{Key: "$filter", Value: bson.D{
						{Key: "input", Value: "$graph"},
						{Key: "as", Value: "g"},
						{Key: "cond", Value: bson.D{
							{Key: "$eq", Value: []interface{}{"$$g.depth", 0}},
						}},
					}}},
					0,
					1,
				}},
			}},
			{Key: "graph", Value: bson.D{
				{Key: "$filter", Value: bson.D{
					{Key: "input", Value: bson.D{
						{Key: "$map", Value: bson.D{
							{Key: "input", Value: bson.D{
								{Key: "$map", Value: bson.D{
									{Key: "input", Value: "$graph"},
									{Key: "as", Value: "g"},
									{Key: "in", Value: bson.D{
										{Key: "$arrayElemAt", Value: []interface{}{
											bson.D{{Key: "$filter", Value: bson.D{
												{Key: "input", Value: "$#g.fields"},
												{Key: "as", Value: "f"},
												{Key: "cond", Value: bson.D{
													{Key: "$and", Value: bson.D{
														{Key: "$eq", Value: []interface{}{
															"$$f.id",
															bson.D{
																{Key: "$arrayElemAt", Value: []interface{}{
																	fieldsstr[1.],
																	"$$g.depth",
																}},
															},
														}},
													}},
													{Key: "$eq", Value: []string{"$$f.type", "ref"}},
												}},
											}}},
											0,
										}},
									}},
								}},
							}},
							{Key: "as", Value: ""},
							{Key: "in", Value: bson.D{
								{Key: "$arrayElemAt", Value: []interface{}{
									bson.D{{Key: "$filter", Value: bson.D{
										{Key: "input", Value: "$graph"},
										{Key: "as", Value: "g1"},
										{Key: "cond", Value: bson.D{
											{Key: "$eq", Value: []string{
												"$$g1.id",
												"$$g.value",
											}},
										}},
									}}},
									0,
								}},
							}},
						}},
					}},
					{Key: "as", Value: "f"},
					{Key: "cond", Value: bson.D{
						{Key: "$ne", Value: []interface{}{"$$f", nil}},
					}},
				}},
			}},
		}},
		{Key: "$sort", Value: bson.D{
			{Key: "graph.depth", Value: 1},
		}},
		{Key: "$addFields", Value: bson.D{
			{Key: "graph", Value: bson.D{
				{Key: "$filter", Value: bson.D{
					{Key: "input", Value: bson.D{
						{Key: "$concatArrays", Value: []string{"$firstGraph", "$graph"}},
					}},
					{Key: "as", Value: "g"},
					{Key: "cond", Value: aggfilter},
				}},
			}},
		}},
		{Key: "$project", Value: bson.D{
			{Key: "firstGraph", Value: 0},
			{Key: "field", Value: 0},
		}},
	}

	cursor, err2 := r.client.Collection().Aggregate(ctx, pipeline)
	if err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	defer func() {
		_ = cursor.Close(ctx)
	}()

	doc := mongodoc.DatasetExtendedDocument{}
	if err2 := bson.Unmarshal(cursor.Current, &doc); err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	docs := make([]*mongodoc.DatasetExtendedDocument, 0, len(fields))
	for i := 0; i < len(fields); i++ {
		var d2 *mongodoc.DatasetExtendedDocument
		if i == 0 {
			d2 = &doc
		} else {
			for _, d := range doc.Graph {
				if i-1 == d.Depth {
					d2 = d
				}
			}
		}
		docs = append(docs, d2)
	}
	res := make(dataset.List, 0, len(docs))
	for i, d := range docs {
		if i > 0 && i-1 != d.Depth {
			return nil, rerror.ErrInternalBy(errors.New("invalid order"))
		}
		ds, err2 := d.DatasetDocument.Model()
		if err2 != nil {
			return nil, rerror.ErrInternalBy(err2)
		}
		res = append(res, ds)
	}
	return res, nil
}

func (r *datasetRepo) Save(ctx context.Context, dataset *dataset.Dataset) error {
	if !r.f.CanWrite(dataset.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewDataset(dataset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *datasetRepo) SaveAll(ctx context.Context, datasetList dataset.List) error {
	if datasetList == nil || len(datasetList) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewDatasets(datasetList, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *datasetRepo) Remove(ctx context.Context, id id.DatasetID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *datasetRepo) RemoveAll(ctx context.Context, ids []id.DatasetID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": id.DatasetIDsToStrings(ids)},
	}))
}

func (r *datasetRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	_, err := r.client.Collection().DeleteMany(ctx, bson.D{
		{Key: "scene", Value: sceneID.String()},
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *datasetRepo) find(ctx context.Context, dst dataset.List, filter interface{}) (dataset.List, error) {
	c := mongodoc.DatasetConsumer{
		Rows: dst,
	}
	if err2 := r.client.Find(ctx, r.readFilter(filter), &c); err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, nil
}

func (r *datasetRepo) findOne(ctx context.Context, filter interface{}) (*dataset.Dataset, error) {
	dst := make([]*dataset.Dataset, 0, 1)
	c := mongodoc.DatasetConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *datasetRepo) paginate(ctx context.Context, filter bson.M, pagination *usecase.Pagination) (dataset.List, *usecase.PageInfo, error) {
	var c mongodoc.DatasetConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), nil, pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

func filterDatasets(ids []id.DatasetID, rows []*dataset.Dataset) []*dataset.Dataset {
	res := make([]*dataset.Dataset, 0, len(ids))
	for _, id := range ids {
		var r2 *dataset.Dataset
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

func (r *datasetRepo) readFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Readable)
}

func (r *datasetRepo) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
