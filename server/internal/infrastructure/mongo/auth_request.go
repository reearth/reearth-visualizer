package mongo

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/auth"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type AuthRequest struct {
	client *mongox.ClientCollection
}

func NewAuthRequest(client *mongox.Client) *AuthRequest {
	r := &AuthRequest{client: client.WithCollection("authRequest")}
	r.init()
	return r
}

func (r *AuthRequest) init() {
	i := r.client.CreateIndex(context.Background(), nil, []string{"id", "code", "subject"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "authRequest", i)
	}
}

func (r *AuthRequest) FindByID(ctx context.Context, id2 id.AuthRequestID) (*auth.Request, error) {
	return r.findOne(ctx, bson.M{"id": id2.String()})
}

func (r *AuthRequest) FindByCode(ctx context.Context, s string) (*auth.Request, error) {
	return r.findOne(ctx, bson.M{"code": s})
}

func (r *AuthRequest) FindBySubject(ctx context.Context, s string) (*auth.Request, error) {
	return r.findOne(ctx, bson.M{"subject": s})
}

func (r *AuthRequest) Save(ctx context.Context, request *auth.Request) error {
	doc, id1 := mongodoc.NewAuthRequest(request)
	return r.client.SaveOne(ctx, id1, doc)
}

func (r *AuthRequest) Remove(ctx context.Context, requestID id.AuthRequestID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": requestID.String()})
}

func (r *AuthRequest) findOne(ctx context.Context, filter any) (*auth.Request, error) {
	c := mongodoc.NewAuthRequestConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}
