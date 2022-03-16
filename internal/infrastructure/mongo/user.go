package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/user"
)

type userRepo struct {
	client *mongodoc.ClientCollection
}

func NewUser(client *mongodoc.Client) repo.User {
	r := &userRepo{client: client.WithCollection("user")}
	r.init()
	return r
}

func (r *userRepo) init() {
	i := r.client.CreateUniqueIndex(context.Background(), []string{"email", "name", "auth0sublist"}, []string{"name"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "user", i)
	}
}

func (r *userRepo) FindByIDs(ctx context.Context, ids []id.UserID) ([]*user.User, error) {
	filter := bson.D{{Key: "id", Value: bson.D{
		{Key: "$in", Value: id.UserIDsToStrings(ids)},
	}}}
	dst := make([]*user.User, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return filterUsers(ids, res), nil
}

func (r *userRepo) FindByID(ctx context.Context, id2 id.UserID) (*user.User, error) {
	filter := bson.D{{Key: "id", Value: id.ID(id2).String()}}
	return r.findOne(ctx, filter)
}

func (r *userRepo) FindByAuth0Sub(ctx context.Context, auth0sub string) (*user.User, error) {
	filter := bson.D{
		{Key: "$or", Value: []bson.D{
			{{Key: "auth0sub", Value: auth0sub}},
			{{Key: "auth0sublist", Value: bson.D{
				{Key: "$elemMatch", Value: bson.D{
					{Key: "$eq", Value: auth0sub},
				}},
			}}},
		}},
	}
	return r.findOne(ctx, filter)
}

func (r *userRepo) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	filter := bson.D{{Key: "email", Value: email}}
	return r.findOne(ctx, filter)
}

func (r *userRepo) FindByName(ctx context.Context, name string) (*user.User, error) {
	filter := bson.D{{Key: "name", Value: name}}
	return r.findOne(ctx, filter)
}

func (r *userRepo) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	filter := bson.D{{Key: "$or", Value: []bson.D{
		{{Key: "email", Value: nameOrEmail}},
		{{Key: "name", Value: nameOrEmail}},
	}}}
	return r.findOne(ctx, filter)
}

func (r *userRepo) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	filter := bson.D{{Key: "verification.code", Value: code}}
	return r.findOne(ctx, filter)
}

func (r *userRepo) FindByPasswordResetRequest(ctx context.Context, pwdResetToken string) (*user.User, error) {
	filter := bson.D{
		{Key: "passwordreset.token", Value: pwdResetToken},
	}
	return r.findOne(ctx, filter)
}

func (r *userRepo) Save(ctx context.Context, user *user.User) error {
	doc, id := mongodoc.NewUser(user)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *userRepo) Remove(ctx context.Context, user id.UserID) error {
	return r.client.RemoveOne(ctx, user.String())
}

func (r *userRepo) find(ctx context.Context, dst []*user.User, filter bson.D) ([]*user.User, error) {
	c := mongodoc.UserConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *userRepo) findOne(ctx context.Context, filter bson.D) (*user.User, error) {
	dst := make([]*user.User, 0, 1)
	c := mongodoc.UserConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func filterUsers(ids []id.UserID, rows []*user.User) []*user.User {
	res := make([]*user.User, 0, len(ids))
	for _, id := range ids {
		var r2 *user.User
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
