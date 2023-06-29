package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestUser_FindByID(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)

	u := user.New().NewID().
		Workspace(user.NewWorkspaceID()).
		Email("hoge@example.com").
		MustBuild()
	r := NewUser(mongox.NewClientWithDatabase(db))

	got, err := r.FindByID(ctx, u.ID())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	_, _ = db.Collection("user").InsertOne(ctx, bson.M{
		"id":    u.ID().String(),
		"email": "hoge@example.com",
		"team":  u.Workspace().String(),
	})

	got, err = r.FindByID(ctx, u.ID())
	assert.NoError(t, err)
	assert.Equal(t, u, got)
}

func TestUser_FindByIDs(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)

	u1 := user.New().NewID().
		Workspace(user.NewWorkspaceID()).
		Name("a").
		Email("hoge@example.com").
		MustBuild()
	u2 := user.New().NewID().
		Workspace(user.NewWorkspaceID()).
		Name("b").
		Email("hoge2@example.com").
		MustBuild()
	r := NewUser(mongox.NewClientWithDatabase(db))

	got, err := r.FindByIDs(ctx, user.IDList{u1.ID(), u2.ID()})
	assert.Nil(t, err)
	assert.Equal(t, []*user.User{nil, nil}, got)

	_, err = db.Collection("user").InsertMany(ctx, []any{
		bson.M{
			"id":    u1.ID().String(),
			"name":  "a",
			"email": "hoge@example.com",
			"team":  u1.Workspace().String(),
		},
		bson.M{
			"id":    u2.ID().String(),
			"name":  "b",
			"email": "hoge2@example.com",
			"team":  u2.Workspace().String(),
		},
	})
	assert.NoError(t, err)

	got, err = r.FindByIDs(ctx, user.IDList{u1.ID(), u2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, []*user.User{u1, u2}, got)
}

func TestUser_FindByAuth0Sub(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)

	u := user.New().NewID().
		Workspace(user.NewWorkspaceID()).
		Email("hoge@example.com").
		Auths([]user.Auth{{Provider: "", Sub: "xxx"}}).
		MustBuild()
	r := NewUser(mongox.NewClientWithDatabase(db))

	got, err := r.FindByAuth0Sub(ctx, "xxx")
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	_, _ = db.Collection("user").InsertOne(ctx, bson.M{
		"id":           u.ID().String(),
		"email":        "hoge@example.com",
		"team":         u.Workspace().String(),
		"auth0sublist": []string{"xxx"},
	})

	got, err = r.FindByAuth0Sub(ctx, "xxx")
	assert.NoError(t, err)
	assert.Equal(t, u, got)
}

func TestUser_FindByEmail(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)

	u := user.New().NewID().
		Workspace(user.NewWorkspaceID()).
		Email("hoge@example.com").
		MustBuild()
	r := NewUser(mongox.NewClientWithDatabase(db))

	got, err := r.FindByEmail(ctx, "hoge@example.com")
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	_, _ = db.Collection("user").InsertOne(ctx, bson.M{
		"id":    u.ID().String(),
		"email": "hoge@example.com",
		"team":  u.Workspace().String(),
	})

	got, err = r.FindByEmail(ctx, "hoge@example.com")
	assert.NoError(t, err)
	assert.Equal(t, u, got)
}

func TestUser_FindByNameOrEmail(t *testing.T) {
	ctx := context.Background()
	db := mongotest.Connect(t)(t)

	u := user.New().NewID().
		Workspace(user.NewWorkspaceID()).
		Name("a").
		Email("hoge@example.com").
		MustBuild()
	r := NewUser(mongox.NewClientWithDatabase(db))

	got, err := r.FindByEmail(ctx, "hoge@example.com")
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	_, _ = db.Collection("user").InsertOne(ctx, bson.M{
		"id":    u.ID().String(),
		"name":  "a",
		"email": "hoge@example.com",
		"team":  u.Workspace().String(),
	})

	got, err = r.FindByNameOrEmail(ctx, "hoge@example.com")
	assert.NoError(t, err)
	assert.Equal(t, u, got)

	got, err = r.FindByNameOrEmail(ctx, "a")
	assert.NoError(t, err)
	assert.Equal(t, u, got)

	got, err = r.FindByNameOrEmail(ctx, "b")
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)
}
