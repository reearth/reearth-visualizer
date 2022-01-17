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
}

func NewDataset(client *mongodoc.Client) repo.Dataset {
	r := &datasetRepo{client: client.WithCollection("dataset")}
	r.init()
	return r
}

func (r *datasetRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene", "schema"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "dataset", i)
	}
}

func (r *datasetRepo) FindByID(ctx context.Context, id2 id.DatasetID, f []id.SceneID) (*dataset.Dataset, error) {
	filter := r.sceneFilter(bson.D{{Key: "id", Value: id.ID(id2).String()}}, f)
	return r.findOne(ctx, filter)
}

func (r *datasetRepo) FindByIDs(ctx context.Context, ids []id.DatasetID, f []id.SceneID) (dataset.List, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "id", Value: bson.D{
			{Key: "$in", Value: id.DatasetIDsToStrings(ids)},
		}},
	}, f)
	dst := make([]*dataset.Dataset, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterDatasets(ids, res), nil
}

func (r *datasetRepo) FindBySchema(ctx context.Context, schemaID id.DatasetSchemaID, f []id.SceneID, pagination *usecase.Pagination) (dataset.List, *usecase.PageInfo, error) {
	filter := r.sceneFilter(bson.D{
		{Key: "schema", Value: id.ID(schemaID).String()},
	}, f)
	return r.paginate(ctx, filter, pagination)
}

func (r *datasetRepo) FindBySchemaAll(ctx context.Context, schemaID id.DatasetSchemaID) (dataset.List, error) {
	filter := bson.D{
		{Key: "schema", Value: id.ID(schemaID).String()},
	}
	return r.find(ctx, nil, filter)
}

func (r *datasetRepo) FindGraph(ctx context.Context, did id.DatasetID, f []id.SceneID, fields []id.DatasetSchemaFieldID) (dataset.List, error) {
	if len(fields) == 0 {
		d, err := r.FindByID(ctx, did, f)
		if err != nil {
			return nil, err
		}
		return dataset.List{d}, nil
	}

	fieldsstr := id.DatasetSchemaFieldIDsToStrings(fields)
	firstField := fieldsstr[0]

	aggfilter := bson.D{}
	if f != nil {
		aggfilter = append(aggfilter, bson.E{Key: "$in", Value: []interface{}{
			"$$g.scene",
			id.SceneIDsToStrings(f),
		}})
	}

	pipeline := bson.D{
		{Key: "$match", Value: r.sceneFilter(bson.D{
			{Key: "id", Value: did.String()},
			{Key: "fields.id", Value: firstField},
		}, f)},
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
			{Key: "restrictSearchWithMatch", Value: r.sceneFilter(bson.D{}, f)},
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
	doc, id := mongodoc.NewDataset(dataset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *datasetRepo) SaveAll(ctx context.Context, datasetList dataset.List) error {
	if datasetList == nil || len(datasetList) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewDatasets(datasetList)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *datasetRepo) Remove(ctx context.Context, id id.DatasetID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *datasetRepo) RemoveAll(ctx context.Context, ids []id.DatasetID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, id.DatasetIDsToStrings(ids))
}

func (r *datasetRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *datasetRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) (dataset.List, *usecase.PageInfo, error) {
	var c mongodoc.DatasetConsumer
	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
	if err2 != nil {
		return nil, nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, pageInfo, nil
}

func (r *datasetRepo) find(ctx context.Context, dst dataset.List, filter bson.D) (dataset.List, error) {
	c := mongodoc.DatasetConsumer{
		Rows: dst,
	}
	if err2 := r.client.Find(ctx, filter, &c); err2 != nil {
		return nil, rerror.ErrInternalBy(err2)
	}
	return c.Rows, nil
}

func (r *datasetRepo) findOne(ctx context.Context, filter bson.D) (*dataset.Dataset, error) {
	dst := make([]*dataset.Dataset, 0, 1)
	c := mongodoc.DatasetConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
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

func (*datasetRepo) sceneFilter(filter bson.D, scenes []id.SceneID) bson.D {
	if scenes == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "scene",
		Value: bson.D{{Key: "$in", Value: id.SceneIDsToStrings(scenes)}},
	})
	return filter
}
