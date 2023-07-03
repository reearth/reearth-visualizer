package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	propertyIndexes = []string{
		"scene",
		"id,scene",
		"schema",
		"schemaplugin",
		"scene,schemaplugin",
		"fields.links.schema",
		"fields.links.schema,scene",
		"fields.links.dataset",
		"fields.links.dataset,scene",
		"items.fields.links.schema",
		"items.fields.links.schema,scene",
		"items.fields.links.dataset",
		"items.fields.links.dataset,scene",
		"items.groups.fields.links.schema",
		"items.groups.fields.links.schema,scene",
		"items.groups.fields.links.dataset",
		"items.groups.fields.links.dataset,scene",
	}
	propertyUniqueIndexes = []string{"id"}
)

type Property struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewProperty(client *mongox.Client) *Property {
	return &Property{
		client: client.WithCollection("property"),
	}
}

func (r *Property) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, propertyIndexes, propertyUniqueIndexes)
}

func (r *Property) Filtered(f repo.SceneFilter) repo.Property {
	return &Property{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Property) FindByID(ctx context.Context, id id.PropertyID) (*property.Property, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Property) FindByIDs(ctx context.Context, ids id.PropertyIDList) (property.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}

	c := mongodoc.NewPropertyConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}

	log.Debugfc(ctx, "mongo: property.FindByIDs: len(c.Result)=%d len(ids)=%d len(readable)=%d len(uniq readable)=%d", len(c.Result), len(ids), len(r.f.Readable), len(lo.Uniq(r.f.Readable)))

	return filterProperties(ids, c.Result), nil
}

func (r *Property) FindLinkedAll(ctx context.Context, id id.SceneID) (property.List, error) {
	return r.find(ctx, bson.M{
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

func (r *Property) FindByDataset(ctx context.Context, sid id.DatasetSchemaID, did id.DatasetID) (property.List, error) {
	return r.find(ctx, bson.M{
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

func (r *Property) FindBySchema(ctx context.Context, psids []id.PropertySchemaID, sid id.SceneID) (property.List, error) {
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
	return r.find(ctx, filter)
}

func (r *Property) FindByPlugin(ctx context.Context, pid id.PluginID, sid id.SceneID) (property.List, error) {
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
	return r.find(ctx, filter)
}

func (r *Property) Save(ctx context.Context, property *property.Property) error {
	if !r.f.CanWrite(property.Scene()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewProperty(property)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *Property) SaveAll(ctx context.Context, properties property.List) error {
	if len(properties) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewProperties(properties, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *Property) UpdateSchemaPlugin(ctx context.Context, old, new id.PluginID, s id.SceneID) error {
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

func (r *Property) Remove(ctx context.Context, id id.PropertyID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Property) RemoveAll(ctx context.Context, ids id.PropertyIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": ids.Strings()},
	}))
}

func (r *Property) RemoveByScene(ctx context.Context, sceneID id.SceneID) error {
	if !r.f.CanWrite(sceneID) {
		return nil
	}
	_, err := r.client.Client().DeleteMany(ctx, bson.M{
		"scene": sceneID.String(),
	})
	if err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	return nil
}

func (r *Property) find(ctx context.Context, filter any) (property.List, error) {
	c := mongodoc.NewPropertyConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Property) findOne(ctx context.Context, filter any) (*property.Property, error) {
	c := mongodoc.NewPropertyConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
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

// func (r *Property) readFilter(filter any) any {
// 	return applySceneFilter(filter, r.f.Readable)
// }

func (r *Property) writeFilter(filter any) any {
	return applySceneFilter(filter, r.f.Writable)
}
