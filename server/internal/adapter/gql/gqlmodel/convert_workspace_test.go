package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToRole(t *testing.T) {
	assert.Equal(t, Role(RoleOwner), ToRole(workspace.RoleOwner))
	assert.Equal(t, Role(RoleMaintainer), ToRole(workspace.RoleMaintainer))
	assert.Equal(t, Role(RoleWriter), ToRole(workspace.RoleWriter))
	assert.Equal(t, Role(RoleReader), ToRole(workspace.RoleReader))
	assert.Equal(t, Role(""), ToRole(workspace.Role("unknown")))
}

func TestFromRole(t *testing.T) {
	assert.Equal(t, workspace.RoleOwner, FromRole(RoleOwner))
	assert.Equal(t, workspace.RoleMaintainer, FromRole(RoleMaintainer))
	assert.Equal(t, workspace.RoleWriter, FromRole(RoleWriter))
	assert.Equal(t, workspace.RoleReader, FromRole(RoleReader))
	assert.Equal(t, workspace.Role(""), FromRole("unknown"))
}
func TestToPolicy(t *testing.T) {
	assert.Equal(t, &Policy{
		ID:                      ID("x"),
		Name:                    "aaa",
		PrivateProject:          lo.ToPtr(true),
		CustomDomainCount:       lo.ToPtr(5),
		PublishableCount:        lo.ToPtr(10),
		AssetStorageSize:        lo.ToPtr(int64(1000)),
		MaximumSizePerAsset:     lo.ToPtr(int64(100)),
		ProjectImportingTimeout: lo.ToPtr(300),
		ProjectCount:            lo.ToPtr(3),
		InstallPluginCount:      lo.ToPtr(15),
		NlsLayersCount:          lo.ToPtr(8),
		// PageCount:             lo.ToPtr(9),
		// BlocksCount:           lo.ToPtr(6),
	}, ToPolicy(policy.New(policy.Option{
		ID:                      policy.ID("x"),
		Name:                    "aaa",
		PrivateProject:          lo.ToPtr(true),
		CustomDomainCount:       lo.ToPtr(5),
		PublishableCount:        lo.ToPtr(10),
		AssetStorageSize:        lo.ToPtr(int64(1000)),
		MaximumSizePerAsset:     lo.ToPtr(int64(100)),
		ProjectImportingTimeout: lo.ToPtr(300),
		ProjectCount:            lo.ToPtr(3),
		InstallPluginCount:      lo.ToPtr(15),
		NLSLayersCount:          lo.ToPtr(8),
		// PageCount:             lo.ToPtr(9),
		// BlocksCount:           lo.ToPtr(6),
	})))
	assert.Nil(t, ToPolicy(nil))
}
