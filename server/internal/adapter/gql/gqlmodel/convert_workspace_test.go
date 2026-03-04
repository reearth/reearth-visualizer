package gqlmodel

import (
	"testing"

	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	"github.com/stretchr/testify/assert"
)

func TestToRole(t *testing.T) {
	assert.Equal(t, Role(RoleOwner), ToRole(accountsRole.RoleOwner))
	assert.Equal(t, Role(RoleMaintainer), ToRole(accountsRole.RoleMaintainer))
	assert.Equal(t, Role(RoleWriter), ToRole(accountsRole.RoleWriter))
	assert.Equal(t, Role(RoleReader), ToRole(accountsRole.RoleReader))
	assert.Equal(t, Role(""), ToRole(accountsRole.RoleType("unknown")))
}

func TestFromRole(t *testing.T) {
	assert.Equal(t, accountsRole.RoleOwner, FromRole(RoleOwner))
	assert.Equal(t, accountsRole.RoleMaintainer, FromRole(RoleMaintainer))
	assert.Equal(t, accountsRole.RoleWriter, FromRole(RoleWriter))
	assert.Equal(t, accountsRole.RoleReader, FromRole(RoleReader))
	assert.Equal(t, accountsRole.RoleType(""), FromRole("unknown"))
}
