package gqlmodel

import (
	"github.com/reearth/reearth-backend/pkg/user"
)

func ToTeam(t *user.Team) *Team {
	if t == nil {
		return nil
	}

	memberMap := t.Members().Members()
	members := make([]*TeamMember, 0, len(memberMap))
	for u, r := range memberMap {
		members = append(members, &TeamMember{
			UserID: u.ID(),
			Role:   toRole(r),
		})
	}

	return &Team{
		ID:       t.ID().ID(),
		Name:     t.Name(),
		Personal: t.IsPersonal(),
		Members:  members,
	}
}

func FromRole(r Role) user.Role {
	switch r {
	case RoleReader:
		return user.RoleReader
	case RoleWriter:
		return user.RoleWriter
	case RoleOwner:
		return user.RoleOwner
	}
	return user.Role("")
}

func toRole(r user.Role) Role {
	switch r {
	case user.RoleReader:
		return RoleReader
	case user.RoleWriter:
		return RoleWriter
	case user.RoleOwner:
		return RoleOwner
	}
	return Role("")
}
