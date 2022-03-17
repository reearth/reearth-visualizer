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
	f      repo.SceneFilter
}

func NewProperty(client *mongodoc.Client) repo.Property {
	r := &propertyRepo{client: client.WithCollection("property")}
	r.init()
	return r
}

func (r *propertyRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"scene", "schema"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "property", i)
	}
}

func (r *propertyRepo) Filtered(f repo.SceneFilter) repo.Property {
	return &propertyRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *propertyRepo) FindByID(ctx context.Context, id id.PropertyID) (*property.Property, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *propertyRepo) FindByIDs(ctx context.Context, ids []id.PropertyID) (property.List, error) {
	filter := bson.M{
		"id": bson.M{
			"$in": id.PropertyIDsToStrings(ids),
		},
	}
	dst := make(property.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterProperties(ids, res), nil
}

func (r *propertyRepo) FindLinkedAll(ctx context.Context, id id.SceneID) (property.List, error) {
	return r.find(ctx, nil, bson.M{
		"scene": id.String(),
		"fields": bson.M{
			"$elemMatch": bson.M{
				"links": bson.M{
					"$not": bson.M{
						"$size": 0,
					},
				},
			},
		},
	})
}

func (r *propertyRepo) FindByDataset(ctx context.Context, sid id.DatasetSchemaID, did id.DatasetID) (property.List, error) {
	return r.find(ctx, nil, bson.M{
		"$or": []bson.M{
			{"fields.links.dataset": did.String()}, // for compatibility
			{"items.fields.links.dataset": did.String()},
			{"items.groups.fields.links.dataset": did.String()},
			{"fields.links.schema": sid.String()}, // for compatibility
			{"items.fields.links.schema": sid.String()},
			{"items.groups.fields.links.schema": sid.String()},
		},
	})
}

func (r *propertyRepo) FindBySchema(ctx context.Context, psids []id.PropertySchemaID, sid id.SceneID) (property.List, error) {
	if len(psids) == 0 || !r.f.CanRead(sid) {
		return nil, nil
	}

	filters := make([]bson.M, 0, len(psids))
	for _, s := range psids {
		filters = append(filters, bson.M{
			"schemaplugin": s.Plugin().String(),
			"schemaname":   s.ID(),
			"scene":        sid.String(),
		})
	}
	filter := bson.M{"$and": filters}
	return r.find(ctx, nil, filter)
}

func (r *propertyRepo) FindByPlugin(ctx context.Context, pid id.PluginID, sid id.SceneID) (property.List, error) {
	if !r.f.CanRead(sid) {
		return nil, rerror.ErrNotFound
	}
	if s := pid.Scene(); s != nil && !r.f.CanRead(*s) {
		return nil, rerror.ErrNotFound
	}
	filter := bson.M{
		"schemaplugin": pid.String(),
		"scene":        sid.String(),
	}
	return r.find(ctx, nil, filter)
}

func (r *propertyRepo) Save(ctx context.Context, property *property.Property) error {
	if !r.f.CanWrite(property.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProperty(property)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *propertyRepo) SaveAll(ctx context.Context, properties property.List) error {
	if len(properties) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewProperties(properties, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *propertyRepo) UpdateSchemaPlugin(ctx context.Context, old, new id.PluginID, s id.SceneID) error {
	if !r.f.CanWrite(s) {
		return nil
	}
	return r.client.UpdateMany(ctx, bson.M{
		"schemaplugin": old.String(),
		"scene":        s.String(),
	}, bson.M{
		"schemaplugin": new.String(),
	})
}

func (r *propertyRepo) Remove(ctx context.Context, id id.PropertyID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *propertyRepo) RemoveAll(ctx context.Context, ids []id.PropertyID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": id.PropertyIDsToStrings(ids)},
	}))
}

func (r *propertyRepo) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	filter := bson.D{
		{Key: "scene", Value: sceneID.String()},
	}
	_, err := r.client.Collection().DeleteMany(ctx, filter)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *propertyRepo) find(ctx context.Context, dst property.List, filter interface{}) (property.List, error) {
	c := mongodoc.PropertyConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *propertyRepo) findOne(ctx context.Context, filter interface{}) (*property.Property, error) {
	dst := make(property.List, 0, 1)
	c := mongodoc.PropertyConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

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

func (r *propertyRepo) readFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Readable)
}

func (r *propertyRepo) writeFilter(filter interface{}) interface{} {
	return applySceneFilter(filter, r.f.Writable)
}
