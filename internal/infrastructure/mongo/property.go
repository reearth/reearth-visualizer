package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"go.mongodb.org/mongo-driver/bson"
)

type propertyRepo struct {
	client *mongodoc.ClientCollection
}

func NewProperty(client *mongodoc.Client) repo.Property {
	r := &propertyRepo{client: client.WithCollection("property")}
	r.init()
	return r
}

func (r *propertyRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "property", i)
	}
}

func (r *propertyRepo) FindByID(ctx context.Context, id2 id.PropertyID, f []id.SceneID) (*property.Property, error) {
	filter := r.sceneFilter(bson.D{{Key: "id", Value: id.ID(id2).String()}}, f)
	return r.findOne(ctx, filter)
}

func (r *propertyRepo) FindByIDs(ctx context.Context, ids []id.PropertyID, f []id.SceneID) (property.List, error) {
	filter := r.sceneFilter(bson.D{{Key: "id", Value: bson.D{{
		Key: "$in", Value: id.PropertyIDToKeys(ids),
	}}}}, f)
	dst := make(property.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterProperties(ids, res), nil
}

func (r *propertyRepo) FindLinkedAll(ctx context.Context, id id.SceneID) (property.List, error) {
	filter := bson.D{
		{Key: "scene", Value: id.String()},
		{Key: "fields", Value: bson.D{
			{Key: "$elemMatch", Value: bson.D{
				{Key: "links", Value: bson.D{{
					Key: "$not", Value: bson.D{{
						Key: "$size", Value: 0,
					}}},
				}},
			}},
		}},
	}
	return r.find(ctx, nil, filter)
}

func (r *propertyRepo) FindByDataset(ctx context.Context, sid id.DatasetSchemaID, did id.DatasetID) (property.List, error) {
	sids := sid.String()
	pids := did.String()
	filter := bson.D{
		{Key: "$or", Value: []bson.D{
			{{Key: "fields.links.dataset", Value: pids}}, // for compatibility
			{{Key: "items.fields.links.dataset", Value: pids}},
			{{Key: "items.groups.fields.links.dataset", Value: pids}},
			{{Key: "fields.links.schema", Value: sids}}, // for compatibility
			{{Key: "items.fields.links.schema", Value: sids}},
			{{Key: "items.groups.fields.links.schema", Value: sids}},
		}},
	}
	return r.find(ctx, nil, filter)
}

func (r *propertyRepo) Save(ctx context.Context, property *property.Property) error {
	doc, id := mongodoc.NewProperty(property)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *propertyRepo) SaveAll(ctx context.Context, properties property.List) error {
	if len(properties) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewProperties(properties)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *propertyRepo) Remove(ctx context.Context, id id.PropertyID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *propertyRepo) RemoveAll(ctx context.Context, ids []id.PropertyID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, id.PropertyIDToKeys(ids))
}

func (r *propertyRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *propertyRepo) find(ctx context.Context, dst property.List, filter bson.D) (property.List, error) {
	c := mongodoc.PropertyConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *propertyRepo) findOne(ctx context.Context, filter bson.D) (*property.Property, error) {
	dst := make(property.List, 0, 1)
	c := mongodoc.PropertyConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

// func (r *propertyRepo) paginate(ctx context.Context, filter bson.D, pagination *usecase.Pagination) (property.List, *usecase.PageInfo, error) {
// 	var c propertyConsumer
// 	pageInfo, err2 := r.client.Paginate(ctx, filter, pagination, &c)
// 	if err2 != nil {
// 		return nil, nil, rerror.ErrInternalBy(err2)
// 	}
// 	return c.rows, pageInfo, nil
// }

func filterProperties(ids []id.PropertyID, rows property.List) property.List {
	res := make(property.List, 0, len(ids))
	for _, id := range ids {
		var r2 *property.Property
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

func (*propertyRepo) sceneFilter(filter bson.D, scenes []id.SceneID) bson.D {
	if scenes == nil {
		return filter
	}
	filter = append(filter, bson.E{
		Key:   "scene",
		Value: bson.D{{Key: "$in", Value: id.SceneIDToKeys(scenes)}},
	})
	return filter
}
