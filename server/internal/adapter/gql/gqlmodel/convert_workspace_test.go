package gqlmodel

import (
	"testing"

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
