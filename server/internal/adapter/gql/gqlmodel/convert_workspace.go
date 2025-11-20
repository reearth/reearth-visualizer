package gqlmodel

import (
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/samber/lo"
)

func ToWorkspace(w *accountsWorkspace.Workspace) *Workspace {
	if w == nil {
		return nil
	}

	memberMap := w.Members().Users()
	members := make([]*WorkspaceMember, 0, len(memberMap))
	for u, r := range memberMap {
		members = append(members, &WorkspaceMember{
			UserID: IDFrom(u),
			Role:   ToRole(r.Role),
		})
	}

	return &Workspace{
		ID:       IDFrom(w.ID()),
		Name:     w.Name(),
		PhotoURL: lo.EmptyableToPtr(w.Metadata().PhotoURL()),
		Personal: w.IsPersonal(),
		PolicyID: (*ID)(w.Policy()),
		Members:  members,
		Alias:    w.Alias(),
	}
}

func ToWorkspaceFromAccounts(w *accountsWorkspace.Workspace) *Workspace {
	if w == nil {
		return nil
	}

	memberMap := w.Members().Users()
	members := make([]*WorkspaceMember, 0, len(memberMap))
	for u, r := range memberMap {
		members = append(members, &WorkspaceMember{
			UserID: IDFrom(u),
			Role:   ToRole(r.Role),
		})
	}

	return &Workspace{
		ID:       IDFrom(w.ID()),
		Name:     w.Name(),
		PhotoURL: lo.EmptyableToPtr(w.Metadata().PhotoURL()),
		Personal: w.IsPersonal(),
		PolicyID: (*ID)(w.Policy()),
		Members:  members,
		Alias:    w.Alias(),
	}
}

func ToRole(r accountsWorkspace.Role) Role {
	switch r {
	case accountsWorkspace.RoleReader:
		return RoleReader
	case accountsWorkspace.RoleWriter:
		return RoleWriter
	case accountsWorkspace.RoleMaintainer:
		return RoleMaintainer
	case accountsWorkspace.RoleOwner:
		return RoleOwner
	}
	return Role("")
}

func FromRole(r Role) accountsWorkspace.Role {
	switch r {
	case RoleReader:
		return accountsWorkspace.RoleReader
	case RoleWriter:
		return accountsWorkspace.RoleWriter
	case RoleMaintainer:
		return accountsWorkspace.RoleMaintainer
	case RoleOwner:
		return accountsWorkspace.RoleOwner
	}
	return accountsWorkspace.Role("")
}

func ToPolicy(p *policy.Policy) *Policy {
	if p == nil {
		return nil
	}

	o := p.Option()
	return &Policy{
		ID:                    ID(o.ID),
		Name:                  o.Name,
		ProjectCount:          o.ProjectCount,
		MemberCount:           o.MemberCount,
		PublishedProjectCount: o.PublishedProjectCount,
		LayerCount:            o.LayerCount,
		AssetStorageSize:      o.AssetStorageSize,
		NlsLayersCount:        o.NLSLayersCount,
		PageCount:             o.PageCount,
		BlocksCount:           o.BlocksCount,
	}
}
