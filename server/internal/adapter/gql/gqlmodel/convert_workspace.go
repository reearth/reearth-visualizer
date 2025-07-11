package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

func ToWorkspace(t *workspace.Workspace) *Team {
	if t == nil {
		return nil
	}

	memberMap := t.Members().Users()
	members := make([]*TeamMember, 0, len(memberMap))
	for u, r := range memberMap {
		members = append(members, &TeamMember{
			UserID: IDFrom(u),
			Role:   ToRole(r.Role),
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
	case workspace.RoleMaintainer:
		return RoleMaintainer
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
	case RoleMaintainer:
		return workspace.RoleMaintainer
	case RoleOwner:
		return workspace.RoleOwner
	}
	return workspace.Role("")
}

func ToPolicy(p *policy.Policy) *Policy {
	if p == nil {
		return nil
	}

	o := p.Option()
	return &Policy{
		ID:                       ID(o.ID),
		Name:                     o.Name,
		MemberCount:              o.MemberCount,
		ProjectCount:             o.ProjectCount,
		PrivateProject:           o.PrivateProject,
		CustomDomainCount:        o.CustomDomainCount,
		PublishableCount:         o.PublishableCount,
		AssetStorageSize:         o.AssetStorageSize,
		MaximumSizePerAsset:      o.MaximumSizePerAsset,
		ProjectImportingTimeout:  o.ProjectImportingTimeout,
		MaximumProjectExportSize: o.MaximumProjectExportSize,
		InstallPluginCount:       o.InstallPluginCount,
		NlsLayersCount:           o.NLSLayersCount,
	}
}
