package gqlmodel

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
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
