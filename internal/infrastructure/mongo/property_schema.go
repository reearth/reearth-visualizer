package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/property"
	"go.mongodb.org/mongo-driver/bson"
)

type propertySchemaRepo struct {
	client *mongodoc.ClientCollection
	f      repo.SceneFilter
}

func NewPropertySchema(client *mongodoc.Client) repo.PropertySchema {
	r := &propertySchemaRepo{client: client.WithCollection("propertySchema")}
	r.init()
	return r
}

func (r *propertySchemaRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "propertySchema", i)
	}
}

func (r *propertySchemaRepo) Filtered(f repo.SceneFilter) repo.PropertySchema {
	return &propertySchemaRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *propertySchemaRepo) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	if ps := builtin.GetPropertySchema(id); ps != nil {
		return ps, nil
	}

	filter := bson.D{{Key: "id", Value: id.String()}}
	return r.findOne(ctx, filter)
}

func (r *propertySchemaRepo) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	// exclude built-in
	b := property.SchemaMap{}
	ids2 := make([]id.PropertySchemaID, 0, len(ids))
	for _, id := range ids {
		if p := builtin.GetPropertySchema(id); p != nil {
			b[id] = p
		} else if s := id.Plugin().Scene(); s == nil || r.f.CanRead(*s) {
			ids2 = append(ids2, id)
		}
	}

	res := make(property.SchemaList, 0, len(ids2))
	var err error

	if len(ids2) > 0 {
		filter := bson.D{{Key: "id", Value: bson.D{{
			Key: "$in", Value: id.PropertySchemaIDsToStrings(ids2),
		}}}}
		dst := make(property.SchemaList, 0, len(ids2))
		res, err = r.find(ctx, dst, filter)
		if err != nil {
			return nil, err
		}
	}

	return res.Concat(b.List()).MapToIDs(ids), nil
}

func (r *propertySchemaRepo) Save(ctx context.Context, m *property.Schema) error {
	if m.ID().Plugin().System() {
		return errors.New("cannnot save system property schema")
	}
	if s := m.Scene(); s != nil && !r.f.CanWrite(*s) {
		return repo.ErrOperationDenied
	}

	doc, id := mongodoc.NewPropertySchema(m)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *propertySchemaRepo) SaveAll(ctx context.Context, m property.SchemaList) error {
	savable := make(property.SchemaList, 0, len(m))
	for _, ps := range m {
		if ps.ID().Plugin().System() {
			continue
		}
		savable = append(savable, ps)
	}

	if len(m) == 0 {
		return nil
	}

	docs, ids := mongodoc.NewPropertySchemas(savable, r.f.Writable)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *propertySchemaRepo) Remove(ctx context.Context, id id.PropertySchemaID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *propertySchemaRepo) RemoveAll(ctx context.Context, ids []id.PropertySchemaID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": id.PropertySchemaIDsToStrings(ids)},
	}))
}

func (r *propertySchemaRepo) find(ctx context.Context, dst property.SchemaList, filter interface{}) (property.SchemaList, error) {
	c := mongodoc.PropertySchemaConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *propertySchemaRepo) findOne(ctx context.Context, filter interface{}) (*property.Schema, error) {
	dst := make(property.SchemaList, 0, 1)
	c := mongodoc.PropertySchemaConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *propertySchemaRepo) readFilter(filter interface{}) interface{} {
	return applyOptionalSceneFilter(filter, r.f.Readable)
}

func (r *propertySchemaRepo) writeFilter(filter interface{}) interface{} {
	return applyOptionalSceneFilter(filter, r.f.Writable)
}
