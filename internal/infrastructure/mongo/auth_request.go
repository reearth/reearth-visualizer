package mongo

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/auth"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
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
	filter := bson.D{{Key: "id", Value: id2.String()}}
	return r.findOne(ctx, filter)
}

func (r *authRequestRepo) FindByCode(ctx context.Context, s string) (*auth.Request, error) {
	filter := bson.D{{Key: "code", Value: s}}
	return r.findOne(ctx, filter)
}

func (r *authRequestRepo) FindBySubject(ctx context.Context, s string) (*auth.Request, error) {
	filter := bson.D{{Key: "subject", Value: s}}
	return r.findOne(ctx, filter)
}

func (r *authRequestRepo) Save(ctx context.Context, request *auth.Request) error {
	doc, id1 := mongodoc.NewAuthRequest(request)
	return r.client.SaveOne(ctx, id1, doc)
}

func (r *authRequestRepo) Remove(ctx context.Context, requestID id.AuthRequestID) error {
	return r.client.RemoveOne(ctx, requestID.String())
}

func (r *authRequestRepo) findOne(ctx context.Context, filter bson.D) (*auth.Request, error) {
	dst := make([]*auth.Request, 0, 1)
	c := mongodoc.AuthRequestConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}
