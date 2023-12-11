package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestPolicy_FindByID(t *testing.T) {
	ctx := context.Background()
	init := mongotest.Connect(t)
	client := init(t)
	r := NewPolicy(mongox.NewClientWithDatabase(client))

	_, _ = client.Collection("policy").InsertOne(ctx, bson.M{
		"id":          "policy",
		"membercount": 1,
	})

	got, err := r.FindByID(ctx, policy.ID("policy"))
	assert.NoError(t, err)
	assert.Equal(t, policy.New(policy.Option{
		ID:          policy.ID("policy"),
		MemberCount: lo.ToPtr(1),
	}), got)

	got2, err2 := r.FindByID(ctx, policy.ID("policy2"))
	assert.Equal(t, rerror.ErrNotFound, err2)
	assert.Nil(t, got2)
}

func TestPolicy_FindByIDs(t *testing.T) {
	ctx := context.Background()
	init := mongotest.Connect(t)
	client := init(t)
	r := NewPolicy(mongox.NewClientWithDatabase(client))

	_, _ = client.Collection("policy").InsertMany(ctx, []any{
		bson.M{
			"id":          "policy1",
			"membercount": 1,
		},
		bson.M{
			"id":          "policy2",
			"membercount": 2,
		},
	})

	got, err := r.FindByIDs(ctx, []policy.ID{"policy1", "policy2"})
	assert.NoError(t, err)
	assert.Equal(
		t,
		[]*policy.Policy{
			policy.New(policy.Option{
				ID:          policy.ID("policy1"),
				MemberCount: lo.ToPtr(1),
			}),
			policy.New(policy.Option{
				ID:          policy.ID("policy2"),
				MemberCount: lo.ToPtr(2),
			}),
		},
		got,
	)
}
