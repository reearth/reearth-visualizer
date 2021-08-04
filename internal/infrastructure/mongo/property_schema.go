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

func (r *propertySchemaRepo) FindByID(ctx context.Context, id id.PropertySchemaID) (*property.Schema, error) {
	if ps := builtin.GetPropertySchema(id); ps != nil {
		return ps, nil
	}

	filter := bson.D{{Key: "id", Value: id.String()}}
	return r.findOne(ctx, filter)
}

func (r *propertySchemaRepo) FindByIDs(ctx context.Context, ids []id.PropertySchemaID) (property.SchemaList, error) {
	// exclude built-in
	b := map[string]*property.Schema{}
	ids2 := make([]id.PropertySchemaID, 0, len(ids))
	for _, id := range ids {
		if p := builtin.GetPropertySchema(id); p != nil {
			b[id.String()] = p
		} else {
			ids2 = append(ids2, id)
		}
	}

	res := make(property.SchemaList, 0, len(ids2))
	var err error

	if len(ids2) > 0 {
		filter := bson.D{{Key: "id", Value: bson.D{{
			Key: "$in", Value: id.PropertySchemaIDToKeys(ids),
		}}}}
		dst := make(property.SchemaList, 0, len(ids))
		res, err = r.find(ctx, dst, filter)
		if err != nil {
			return nil, err
		}
	}

	// combine built-in and mongo results
	results := make(property.SchemaList, 0, len(ids))
	for _, id := range ids {
		if p, ok := b[id.String()]; ok {
			results = append(results, p)
			continue
		}
		found := false
		for _, p := range res {
			if p != nil && p.ID() == id {
				results = append(results, p)
				found = true
				break
			}
		}
		if !found {
			results = append(results, nil)
		}
	}

	return filterPropertySchemas(ids, results), nil
}

func (r *propertySchemaRepo) Save(ctx context.Context, m *property.Schema) error {
	if m.ID().System() {
		return errors.New("cannnot save system property schema")
	}

	doc, id := mongodoc.NewPropertySchema(m)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *propertySchemaRepo) SaveAll(ctx context.Context, m property.SchemaList) error {
	for _, ps := range m {
		if ps.ID().System() {
			return errors.New("cannnot save system property schema")
		}
	}

	if len(m) == 0 {
		return nil
	}

	docs, ids := mongodoc.NewPropertySchemas(m)
	return r.client.SaveAll(ctx, ids, docs)
}

func (r *propertySchemaRepo) Remove(ctx context.Context, id id.PropertySchemaID) error {
	return r.client.RemoveOne(ctx, id.String())
}

func (r *propertySchemaRepo) RemoveAll(ctx context.Context, ids []id.PropertySchemaID) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, id.PropertySchemaIDToKeys(ids))
}

func (r *propertySchemaRepo) find(ctx context.Context, dst property.SchemaList, filter bson.D) (property.SchemaList, error) {
	c := mongodoc.PropertySchemaConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *propertySchemaRepo) findOne(ctx context.Context, filter bson.D) (*property.Schema, error) {
	dst := make(property.SchemaList, 0, 1)
	c := mongodoc.PropertySchemaConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterPropertySchemas(ids []id.PropertySchemaID, rows property.SchemaList) property.SchemaList {
	res := make(property.SchemaList, 0, len(ids))
	for _, id := range ids {
		var r2 *property.Schema
		if ps := builtin.GetPropertySchema(id); ps != nil {
			r2 = ps
		} else {
			for _, r := range rows {
				if r.ID() == id {
					r2 = r
					break
				}
			}
		}
		res = append(res, r2)
	}
	return res
}
