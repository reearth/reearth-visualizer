package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestPolicy_FindByID(t *testing.T) {
	ctx := context.Background()
	init := connect(t)
	client := init(t)
	r := NewPolicy(mongodoc.NewClientWithDatabase(client))

	_, _ = client.Collection("policy").InsertOne(ctx, bson.M{
		"id":          "policy",
		"membercount": 1,
	})

	got, err := r.FindByID(ctx, workspace.PolicyID("policy"))
	assert.NoError(t, err)
	assert.Equal(t, workspace.NewPolicy(workspace.PolicyOption{
		ID:          workspace.PolicyID("policy"),
		MemberCount: lo.ToPtr(1),
	}), got)

	got2, err2 := r.FindByID(ctx, workspace.PolicyID("policy2"))
	assert.Equal(t, rerror.ErrNotFound, err2)
	assert.Nil(t, got2)
}

func TestPolicy_FindByIDs(t *testing.T) {
	ctx := context.Background()
	init := connect(t)
	client := init(t)
	r := NewPolicy(mongodoc.NewClientWithDatabase(client))

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

	got, err := r.FindByIDs(ctx, []workspace.PolicyID{"policy1", "policy2"})
	assert.NoError(t, err)
	assert.Equal(
		t,
		[]*workspace.Policy{
			workspace.NewPolicy(workspace.PolicyOption{
				ID:          workspace.PolicyID("policy1"),
				MemberCount: lo.ToPtr(1),
			}),
			workspace.NewPolicy(workspace.PolicyOption{
				ID:          workspace.PolicyID("policy2"),
				MemberCount: lo.ToPtr(2),
			}),
		},
		got,
	)
}
