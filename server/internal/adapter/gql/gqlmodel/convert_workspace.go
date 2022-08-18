package gqlmodel

import "github.com/reearth/reearth/server/pkg/workspace"

func ToWorkspace(t *workspace.Workspace) *Team {
	if t == nil {
		return nil
	}

	memberMap := t.Members().Members()
	members := make([]*TeamMember, 0, len(memberMap))
	for u, r := range memberMap {
		members = append(members, &TeamMember{
			UserID: IDFrom(u),
			Role:   ToRole(r),
		})
	}

	return &Team{
		ID:       IDFrom(t.ID()),
		Name:     t.Name(),
		Personal: t.IsPersonal(),
		PolicyID: (*ID)(t.Policy()),
		Members:  members,
	}
}

func ToRole(r workspace.Role) Role {
	switch r {
	case workspace.RoleReader:
		return RoleReader
	case workspace.RoleWriter:
		return RoleWriter
	case workspace.RoleOwner:
		return RoleOwner
	}
	return Role("")
}

func FromRole(r Role) workspace.Role {
	switch r {
	case RoleReader:
		return workspace.RoleReader
	case RoleWriter:
		return workspace.RoleWriter
	case RoleOwner:
		return workspace.RoleOwner
	}
	return workspace.Role("")
}

func ToPolicy(p *workspace.Policy) *Policy {
	o := p.Option()
	return &Policy{
		ProjectCount:          o.ProjectCount,
		NemberCount:           o.LayerCount,
		PublishedProjectCount: o.PublishedProjectCount,
		LayerCount:            o.LayerCount,
		AssetStorageSize:      o.AssetStorageSize,
	}
}
