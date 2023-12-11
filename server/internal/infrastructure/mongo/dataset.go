package mongo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"

	"github.com/reearth/reearth/server/internal/usecase/repo"
)

var (
	datasetIndexes = []string{
		"scene",
		"id,scene",
		"schema,id",
		"scene,schema",
		"schema,id,scene",
	}
	datasetUniqueIndexes = []string{"id"}
)

type Dataset struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewDataset(client *mongox.Client) *Dataset {
	return &Dataset{
		client: client.WithCollection("dataset"),
	}
}

func (r *Dataset) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, datasetIndexes, datasetUniqueIndexes)
}

func (r *Dataset) Filtered(f repo.SceneFilter) repo.Dataset {
	return &Dataset{
		client: r.client,
		f:      r.f.Merge(f),
	}
}
func (r *Dataset) FindByID(ctx context.Context, id id.DatasetID) (*dataset.Dataset, error) {
	return r.findOne(ctx, bson.M{"id": id.String()})
}

func (r *Dataset) FindByIDs(ctx context.Context, ids id.DatasetIDList) (dataset.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make([]*dataset.Dataset, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterDatasets(ids, res), nil
}

func (r *Dataset) FindBySchema(ctx context.Context, schemaID id.DatasetSchemaID, pagination *usecasex.Pagination) (dataset.List, *usecasex.PageInfo, error) {
	return r.paginate(ctx, bson.M{
		"schema": schemaID.String(),
	}, pagination)
}

func (r *Dataset) CountBySchema(ctx context.Context, id id.DatasetSchemaID) (int, error) {
	res, err := r.client.Count(ctx, r.readFilter(bson.M{
		"schema": id.String(),
	}))
	if err != nil {
		return 0, err
	}
	return int(res), nil
}

func (r *Dataset) FindBySchemaAll(ctx context.Context, schemaID id.DatasetSchemaID) (dataset.List, error) {
	return r.find(ctx, nil, bson.M{
		"schema": schemaID.String(),
	})
}

func (r *Dataset) FindBySchemaAllBy(ctx context.Context, s id.DatasetSchemaID, cb func(*dataset.Dataset) error) error {
	c := mongox.SimpleConsumer[mongodoc.DatasetDocument](func(d mongodoc.DatasetDocument) error {
		m, err := d.Model()
		if err != nil {
			return err
		}
		if r.f.Readable != nil && !r.f.Readable.Has(m.Scene()) {
			return nil
		}
		return cb(m)
	})

	if err := r.client.Find(ctx, bson.M{
		"schema": s.String(),
	}, c); err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func (r *Dataset) FindGraph(ctx context.Context, did id.DatasetID, fields id.DatasetFieldIDList) (dataset.List, error) {
	if len(fields) == 0 {
		d, err := r.FindByID(ctx, did)
		if err != nil {
			return nil, err
		}
		return dataset.List{d}, nil
	}

	fieldsstr := fields.Strings()
	firstField := fieldsstr[0]

	aggfilter := bson.D{}
	if r.f.Readable != nil {
		aggfilter = append(aggfilter, bson.E{Key: "$in", Value: []interface{}{
			"$$g.scene",
			r.f.Readable.Strings(),
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

	cursor, err2 := r.client.Client().Aggregate(ctx, pipeline)
	if err2 != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err2)
	}
	defer func() {
		_ = cursor.Close(ctx)
	}()

	doc := mongodoc.DatasetExtendedDocument{}
	if err2 := bson.Unmarshal(cursor.Current, &doc); err2 != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err2)
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
			return nil, rerror.ErrInternalByWithContext(ctx, errors.New("invalid order"))
		}
		ds, err2 := d.DatasetDocument.Model()
		if err2 != nil {
			return nil, rerror.ErrInternalByWithContext(ctx, err2)
		}
		res = append(res, ds)
	}
	return res, nil
}

func (r *Dataset) Save(ctx context.Context, dataset *dataset.Dataset) error {
	if !r.f.CanWrite(dataset.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewDataset(dataset)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Dataset) SaveAll(ctx context.Context, datasetList dataset.List) error {
	if len(datasetList) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewDatasets(datasetList, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *Dataset) Remove(ctx context.Context, id id.DatasetID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Dataset) RemoveAll(ctx context.Context, ids id.DatasetIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *Dataset) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	_, err := r.client.Client().DeleteMany(ctx, bson.D{
		{Key: "scene", Value: sceneID.String()},
	})
	if err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	return nil
}

func (r *Dataset) find(ctx context.Context, dst dataset.List, filter interface{}) (dataset.List, error) {
	c := mongodoc.NewDatasetConsumer(r.f.Readable)
	if err2 := r.client.Find(ctx, filter, c); err2 != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err2)
	}
	return c.Result, nil
}

func (r *Dataset) findOne(ctx context.Context, filter interface{}) (*dataset.Dataset, error) {
	c := mongodoc.NewDatasetConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *Dataset) paginate(ctx context.Context, filter bson.M, pagination *usecasex.Pagination) (dataset.List, *usecasex.PageInfo, error) {
	c := mongodoc.NewDatasetConsumer(r.f.Readable)
	pageInfo, err := r.client.Paginate(ctx, filter, nil, pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	return c.Result, pageInfo, nil
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

func (r *Dataset) readFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Readable)
}

func (r *Dataset) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
