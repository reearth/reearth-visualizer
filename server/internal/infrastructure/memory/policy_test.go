package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestPolicy_FindByID(t *testing.T) {
	privateProject := true
	customDomainCount := 5
	publishableCount := 10
	assetStorageSize := int64(1000)
	maximumSizePerAsset := int64(100)
	projectImportingTimeout := 300
	projectCount := 3
	installPluginCount := 10
	nlsLayersCount := 20

	p := policy.New(policy.Option{
		ID:                      policy.ID("a"),
		Name:                    "Test Policy",
		PrivateProject:          &privateProject,
		CustomDomainCount:       &customDomainCount,
		PublishableCount:        &publishableCount,
		AssetStorageSize:        &assetStorageSize,
		MaximumSizePerAsset:     &maximumSizePerAsset,
		ProjectImportingTimeout: &projectImportingTimeout,
		ProjectCount:            &projectCount,
		InstallPluginCount:      &installPluginCount,
		NLSLayersCount:          &nlsLayersCount,
	})
	r := NewPolicyWith(p)

	ctx := context.Background()
	got, err := r.FindByID(ctx, policy.ID("a"))
	assert.Equal(t, p, got)
	assert.NotSame(t, p, got)
	assert.NoError(t, err)

	got, err = r.FindByID(ctx, policy.ID("x"))
	assert.Nil(t, got)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func TestPolicy_FindByIDs(t *testing.T) {
	privateProject1 := true
	customDomainCount1 := 5
	publishableCount1 := 10
	assetStorageSize1 := int64(1000)

	privateProject2 := false
	customDomainCount2 := 3
	publishableCount2 := 5
	assetStorageSize2 := int64(500)

	p1 := policy.New(policy.Option{
		ID:                policy.ID("a"),
		Name:              "Test Policy 1",
		PrivateProject:    &privateProject1,
		CustomDomainCount: &customDomainCount1,
		PublishableCount:  &publishableCount1,
		AssetStorageSize:  &assetStorageSize1,
	})
	p2 := policy.New(policy.Option{
		ID:                policy.ID("b"),
		Name:              "Test Policy 2",
		PrivateProject:    &privateProject2,
		CustomDomainCount: &customDomainCount2,
		PublishableCount:  &publishableCount2,
		AssetStorageSize:  &assetStorageSize2,
	})
	r := NewPolicyWith(p1, p2)

	ctx := context.Background()
	got, err := r.FindByIDs(ctx, []policy.ID{"a", "b", "c"})
	assert.Equal(t, []*policy.Policy{p1, p2}, got)
	assert.NoError(t, err)
}
