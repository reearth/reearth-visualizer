package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"

	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func TestToRole(t *testing.T) {
	assert.Equal(t, Role(RoleOwner), ToRole(accountsWorkspace.RoleOwner))
	assert.Equal(t, Role(RoleMaintainer), ToRole(accountsWorkspace.RoleMaintainer))
	assert.Equal(t, Role(RoleWriter), ToRole(accountsWorkspace.RoleWriter))
	assert.Equal(t, Role(RoleReader), ToRole(accountsWorkspace.RoleReader))
	assert.Equal(t, Role(""), ToRole(accountsWorkspace.Role("unknown")))
}

func TestFromRole(t *testing.T) {
	assert.Equal(t, accountsWorkspace.RoleOwner, FromRole(RoleOwner))
	assert.Equal(t, accountsWorkspace.RoleMaintainer, FromRole(RoleMaintainer))
	assert.Equal(t, accountsWorkspace.RoleWriter, FromRole(RoleWriter))
	assert.Equal(t, accountsWorkspace.RoleReader, FromRole(RoleReader))
	assert.Equal(t, accountsWorkspace.Role(""), FromRole("unknown"))
}

func TestToPolicy(t *testing.T) {
	assert.Equal(t, &Policy{
		ID:                    ID("x"),
		Name:                  "aaa",
		ProjectCount:          lo.ToPtr(1),
		MemberCount:           lo.ToPtr(2),
		PublishedProjectCount: lo.ToPtr(3),
		LayerCount:            lo.ToPtr(4),
		AssetStorageSize:      lo.ToPtr(int64(5)),
		NlsLayersCount:        lo.ToPtr(8),
		PageCount:             lo.ToPtr(9),
		BlocksCount:           lo.ToPtr(6),
	}, ToPolicy(policy.New(policy.Option{
		ID:                    policy.ID("x"),
		Name:                  "aaa",
		ProjectCount:          lo.ToPtr(1),
		MemberCount:           lo.ToPtr(2),
		PublishedProjectCount: lo.ToPtr(3),
		LayerCount:            lo.ToPtr(4),
		AssetStorageSize:      lo.ToPtr(int64(5)),
		DatasetCount:          lo.ToPtr(6),
		DatasetSchemaCount:    lo.ToPtr(7),
		NLSLayersCount:        lo.ToPtr(8),
		PageCount:             lo.ToPtr(9),
		BlocksCount:           lo.ToPtr(6),
	})))
	assert.Nil(t, ToPolicy(nil))
}
