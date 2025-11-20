package mongo

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	userIndexes       = []string{"email", "workspace"}
	userUniqueIndexes = []string{"id"}
)

type User struct {
	client *mongox.ClientCollection
	f      accountsRepo.WorkspaceFilter
}

func NewUser(client *mongox.Client) accountsRepo.User {
	return &User{
		client: client.WithCollection("user"),
	}
}

func (r *User) Init(ctx context.Context) error {
	return createIndexes(ctx, r.client, userIndexes, userUniqueIndexes)
}

func (r *User) Filtered(f accountsRepo.WorkspaceFilter) accountsRepo.User {
	return &User{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *User) FindAll(ctx context.Context) ([]*user.User, error) {
	filter := bson.M{}
	return r.find(ctx, filter)
}

func (r *User) FindByID(ctx context.Context, uid id.UserID) (*user.User, error) {
	return r.findOne(ctx, bson.M{"id": uid.String()})
}

func (r *User) FindByIDs(ctx context.Context, ids id.UserIDList) ([]*user.User, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	return r.find(ctx, bson.M{"id": bson.M{"$in": ids.Strings()}})
}

func (r *User) FindByIDsWithPagination(ctx context.Context, ids id.UserIDList, pagination *usecasex.Pagination, nameOrAlias ...string) ([]*user.User, *usecasex.PageInfo, error) {
	if len(ids) == 0 {
		return nil, &usecasex.PageInfo{TotalCount: 0}, nil
	}

	filter := bson.M{"id": bson.M{"$in": ids.Strings()}}

	// Add name or alias filter if provided
	if len(nameOrAlias) > 0 && nameOrAlias[0] != "" {
		filter = bson.M{
			"$and": []bson.M{
				filter,
				{"$or": []bson.M{
					{"name": bson.M{"$regex": nameOrAlias[0], "$options": "i"}},
					{"alias": bson.M{"$regex": nameOrAlias[0], "$options": "i"}},
				}},
			},
		}
	}

	c := mongodoc.NewUserConsumer(r.f.Readable)
	pageInfo, err := r.client.Paginate(ctx, filter, nil, pagination, c)
	if err != nil {
		return nil, nil, err
	}

	return c.Result, pageInfo, nil
}

func (r *User) FindBySub(ctx context.Context, sub string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"auths.sub": sub})
}

func (r *User) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"email": email})
}

func (r *User) FindByName(ctx context.Context, name string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"name": name})
}

func (r *User) FindByAlias(ctx context.Context, alias string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"alias": alias})
}

func (r *User) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	filter := bson.M{"$or": []bson.M{
		{"name": nameOrEmail},
		{"email": nameOrEmail},
	}}
	return r.findOne(ctx, filter)
}

func (r *User) SearchByKeyword(ctx context.Context, keyword string, fields ...string) ([]*user.User, error) {
	// Default search in name and email
	if len(fields) == 0 {
		fields = []string{"name", "email"}
	}

	orConditions := make([]bson.M, 0, len(fields))
	for _, field := range fields {
		orConditions = append(orConditions, bson.M{
			field: bson.M{"$regex": keyword, "$options": "i"},
		})
	}

	return r.find(ctx, bson.M{"$or": orConditions})
}

func (r *User) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"verification.code": code})
}

func (r *User) FindByPasswordResetRequest(ctx context.Context, token string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"passwordreset.token": token})
}

func (r *User) FindBySubOrCreate(ctx context.Context, u *user.User, sub string) (*user.User, error) {
	// Try to find by sub first
	existing, err := r.FindBySub(ctx, sub)
	if err == nil {
		return existing, nil
	}
	if err != rerror.ErrNotFound {
		return nil, err
	}

	// Create new user
	if err := r.Create(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (r *User) Create(ctx context.Context, u *user.User) error {
	if !r.f.CanWrite(u.Workspace()) {
		return repo.ErrOperationDenied
	}

	doc, id := mongodoc.NewUser(u)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *User) Save(ctx context.Context, u *user.User) error {
	if !r.f.CanWrite(u.Workspace()) {
		return repo.ErrOperationDenied
	}

	doc, id := mongodoc.NewUser(u)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *User) Remove(ctx context.Context, uid id.UserID) error {
	// Need to check workspace permission
	u, err := r.FindByID(ctx, uid)
	if err != nil {
		return err
	}

	if !r.f.CanWrite(u.Workspace()) {
		return repo.ErrOperationDenied
	}

	return r.client.RemoveOne(ctx, bson.M{"id": uid.String()})
}

// Helper methods

func (r *User) find(ctx context.Context, filter bson.M) ([]*user.User, error) {
	c := mongodoc.NewUserConsumer(r.f.Readable)
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *User) findOne(ctx context.Context, filter bson.M) (*user.User, error) {
	c := mongodoc.NewUserConsumer(r.f.Readable)
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, rerror.ErrNotFound
		}
		return nil, err
	}
	if len(c.Result) == 0 {
		return nil, rerror.ErrNotFound
	}
	return c.Result[0], nil
}
