package groupRoleAssignment

import (
	reearthAccountId "github.com/reearth/reearth-account/pkg/id"
)

type GroupRoleAssignment struct {
	id      ID
	groupID reearthAccountId.GroupID
	roleIDs []reearthAccountId.RoleID
}

func (g *GroupRoleAssignment) ID() ID {
	if g == nil {
		return ID{}
	}
	return g.id
}

func (g *GroupRoleAssignment) GroupID() reearthAccountId.GroupID {
	if g == nil {
		return reearthAccountId.GroupID{}
	}
	return g.groupID
}

func (g *GroupRoleAssignment) RoleIDs() []reearthAccountId.RoleID {
	if g == nil {
		return nil
	}
	return g.roleIDs
}
