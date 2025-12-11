package gqlmodel

import (
	"github.com/samber/lo"

	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
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
		Personal: w.IsPersonal(),
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
			Role:   ToRole(accountsWorkspace.Role(r.Role)),
		})
	}

	return &Workspace{
		ID:       IDFrom(w.ID()),
		Name:     w.Name(),
		PhotoURL: lo.EmptyableToPtr(w.Metadata().PhotoURL()),
		Personal: w.IsPersonal(),
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
