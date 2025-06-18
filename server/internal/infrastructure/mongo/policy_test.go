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
		"id":                      "policy",
		"name":                    "Test Policy",
		"privateproject":          true,
		"customdomaincount":       5,
		"publishablecount":        10,
		"assetstoragesize":        1000,
		"maximumsizeperasset":     100,
		"projectimportingtimeout": 300,
		"projectcount":            3,
		"installplugincount":      10,
		"nlslayerscount":          20,
	})

	got, err := r.FindByID(ctx, policy.ID("policy"))
	assert.NoError(t, err)
	assert.Equal(t, policy.New(policy.Option{
		ID:                      policy.ID("policy"),
		Name:                    "Test Policy",
		PrivateProject:          lo.ToPtr(true),
		CustomDomainCount:       lo.ToPtr(5),
		PublishableCount:        lo.ToPtr(10),
		AssetStorageSize:        lo.ToPtr(int64(1000)),
		MaximumSizePerAsset:     lo.ToPtr(int64(100)),
		ProjectImportingTimeout: lo.ToPtr(300),
		ProjectCount:            lo.ToPtr(3),
		InstallPluginCount:      lo.ToPtr(10),
		NLSLayersCount:          lo.ToPtr(20),
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
			"id":                "policy1",
			"name":              "Test Policy 1",
			"privateproject":    true,
			"customdomaincount": 5,
			"publishablecount":  10,
			"assetstoragesize":  1000,
		},
		bson.M{
			"id":                "policy2",
			"name":              "Test Policy 2",
			"privateproject":    false,
			"customdomaincount": 3,
			"publishablecount":  5,
			"assetstoragesize":  500,
		},
	})

	got, err := r.FindByIDs(ctx, []policy.ID{"policy1", "policy2"})
	assert.NoError(t, err)
	assert.Equal(
		t,
		[]*policy.Policy{
			policy.New(policy.Option{
				ID:                policy.ID("policy1"),
				Name:              "Test Policy 1",
				PrivateProject:    lo.ToPtr(true),
				CustomDomainCount: lo.ToPtr(5),
				PublishableCount:  lo.ToPtr(10),
				AssetStorageSize:  lo.ToPtr(int64(1000)),
			}),
			policy.New(policy.Option{
				ID:                policy.ID("policy2"),
				Name:              "Test Policy 2",
				PrivateProject:    lo.ToPtr(false),
				CustomDomainCount: lo.ToPtr(3),
				PublishableCount:  lo.ToPtr(5),
				AssetStorageSize:  lo.ToPtr(int64(500)),
			}),
		},
		got,
	)
}
