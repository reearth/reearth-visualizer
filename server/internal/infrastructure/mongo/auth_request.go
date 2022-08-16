package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/auth"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/log"
	"go.mongodb.org/mongo-driver/bson"
)

type authRequestRepo struct {
	client *mongodoc.ClientCollection
}

func NewAuthRequest(client *mongodoc.Client) repo.AuthRequest {
	r := &authRequestRepo{client: client.WithCollection("authRequest")}
	r.init()
	return r
}

func (r *authRequestRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"code", "subject"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "authRequest", i)
	}
}

func (r *authRequestRepo) FindByID(ctx context.Context, id2 id.AuthRequestID) (*auth.Request, error) {
	return r.findOne(ctx, bson.M{"id": id2.String()})
}

func (r *authRequestRepo) FindByCode(ctx context.Context, s string) (*auth.Request, error) {
	return r.findOne(ctx, bson.M{"code": s})
}

func (r *authRequestRepo) FindBySubject(ctx context.Context, s string) (*auth.Request, error) {
	return r.findOne(ctx, bson.M{"subject": s})
}

func (r *authRequestRepo) Save(ctx context.Context, request *auth.Request) error {
	doc, id1 := mongodoc.NewAuthRequest(request)
	return r.client.SaveOne(ctx, id1, doc)
}

func (r *authRequestRepo) Remove(ctx context.Context, requestID id.AuthRequestID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": requestID.String()})
}

func (r *authRequestRepo) findOne(ctx context.Context, filter interface{}) (*auth.Request, error) {
	dst := make([]*auth.Request, 0, 1)
	c := mongodoc.AuthRequestConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}
