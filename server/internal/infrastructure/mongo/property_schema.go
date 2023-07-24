package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	propertySchemaIndexes       = []string{}
	propertySchemaUniqueIndexes = []string{"id"}
)

type PropertySchema struct {
	client *mongox.ClientCollection
	f      repo.SceneFilter
}

func NewPropertySchema(client *mongox.Client) *PropertySchema {
	return &PropertySchema{
		client: client.WithCollection("propertySchema"),
	}
}

func (r *PropertySchema) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, propertySchemaIndexes, propertySchemaUniqueIndexes)
}

func (r *PropertySchema) Filtered(f repo.SceneFilter) repo.PropertySchema {
	return &PropertySchema{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *PropertySchema) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	if ps := builtin.GetPropertySchema(id); ps != nil {
		return ps, nil
	}

	filter := bson.D{{Key: "id", Value: id.String()}}
	return r.findOne(ctx, filter)
}

func (r *PropertySchema) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	if len(ids) == 0 {
		return nil, nil
	}

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

func (r *PropertySchema) Save(ctx context.Context, m *property.Schema) error {
	if m.ID().Plugin().System() {
		return errors.New("cannnot save system property schema")
	}
	if s := m.Scene(); s != nil && !r.f.CanWrite(*s) {
		return repo.ErrOperationDenied
	}

	doc, id := mongodoc.NewPropertySchema(m)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *PropertySchema) SaveAll(ctx context.Context, m property.SchemaList) error {
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

func (r *PropertySchema) Remove(ctx context.Context, id id.PropertySchemaID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *PropertySchema) RemoveAll(ctx context.Context, ids []id.PropertySchemaID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{
		"id": bson.M{"$in": id.PropertySchemaIDsToStrings(ids)},
	}))
}

func (r *PropertySchema) find(ctx context.Context, dst property.SchemaList, filter any) (property.SchemaList, error) {
	c := mongodoc.NewPropertySchemaConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *PropertySchema) findOne(ctx context.Context, filter any) (*property.Schema, error) {
	c := mongodoc.NewPropertySchemaConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

// func (r *PropertySchema) readFilter(filter any) any {
// 	return applyOptionalSceneFilter(filter, r.f.Readable)
// }

func (r *PropertySchema) writeFilter(filter any) any {
	return applyOptionalSceneFilter(filter, r.f.Writable)
}
