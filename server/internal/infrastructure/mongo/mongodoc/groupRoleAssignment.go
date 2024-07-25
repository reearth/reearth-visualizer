package mongodoc

import (
	reearthAccountId "github.com/reearth/reearth-account/pkg/id"
	"github.com/reearth/reearth/server/pkg/groupRoleAssignment"
	"github.com/reearth/reearth/server/pkg/id"
)

type GroupRoleAssignmentDocument struct {
	ID      string
	GroupID string
	RoleIDs []string
}

type GroupRoleAssignmentDocumentConsumer = Consumer[*GroupRoleAssignmentDocument, *groupRoleAssignment.GroupRoleAssignment]

func NewGroupRoleAssignmentConsumer() *GroupRoleAssignmentDocumentConsumer {
	return NewConsumer[*GroupRoleAssignmentDocument, *groupRoleAssignment.GroupRoleAssignment](func(a *groupRoleAssignment.GroupRoleAssignment) bool {
		return true
	})
}

func NewGroupRoleAssignment(g groupRoleAssignment.GroupRoleAssignment) (*GroupRoleAssignmentDocument, string) {
	id := g.ID().String()

	roleIds := make([]string, 0, len(g.RoleIDs()))
	for _, r := range g.RoleIDs() {
		roleIds = append(roleIds, r.String())
	}

	return &GroupRoleAssignmentDocument{
		ID:      id,
		GroupID: g.GroupID().String(),
		RoleIDs: roleIds,
	}, id
}

func (d *GroupRoleAssignmentDocument) Model() (*groupRoleAssignment.GroupRoleAssignment, error) {
	if d == nil {
		return nil, nil
	}

	gid, err := id.GroupRoleAssignmentIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	groupId, err := reearthAccountId.GroupIDFrom(d.GroupID)
	if err != nil {
		return nil, err
	}

	roleIds, err := reearthAccountId.RoleIDListFrom(d.RoleIDs)
	if err != nil {
		return nil, err
	}

	return groupRoleAssignment.New().
		ID(gid).
		GroupID(groupId).
		RoleIDs(roleIds).
		Build()
}
