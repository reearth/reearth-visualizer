package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
	"go.mongodb.org/mongo-driver/bson"
)

type Policy struct {
	c *mongodoc.ClientCollection
}

func NewPolicy(c *mongodoc.Client) *Policy {
	r := &Policy{c: c.WithCollection("policy")}
	r.init()
	return r
}

func (r *Policy) init() {
	i := r.c.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "policy", i)
	}
}

func (r *Policy) FindByID(ctx context.Context, id workspace.PolicyID) (*workspace.Policy, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Policy) FindByIDs(ctx context.Context, ids []workspace.PolicyID) ([]*workspace.Policy, error) {
	return r.find(ctx, bson.M{
		"id": bson.M{
			"$in": util.Map(ids, func(id workspace.PolicyID) string { return id.String() }),
		},
	})
}

func (r *Policy) findOne(ctx context.Context, filter interface{}) (*workspace.Policy, error) {
	dst := make([]*workspace.Policy, 0, 1)
	c := mongodoc.PolicyConsumer{
		Rows: dst,
	}
	if err := r.c.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *Policy) find(ctx context.Context, filter interface{}) ([]*workspace.Policy, error) {
	dst := make([]*workspace.Policy, 0, 1)
	c := mongodoc.PolicyConsumer{
		Rows: dst,
	}
	if err := r.c.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}
