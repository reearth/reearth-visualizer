package gqlmodel

import (
	"github.com/samber/lo"

	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
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
			Role:   ToRole(accountsRole.RoleType(r.Role)),
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
			Role:   ToRole(accountsRole.RoleType(r.Role)),
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

func ToRole(r accountsRole.RoleType) Role {
	switch r {
	case accountsRole.RoleReader:
		return RoleReader
	case accountsRole.RoleWriter:
		return RoleWriter
	case accountsRole.RoleMaintainer:
		return RoleMaintainer
	case accountsRole.RoleOwner:
		return RoleOwner
	}
	return Role("")
}

func FromRole(r Role) accountsRole.RoleType {
	switch r {
	case RoleReader:
		return accountsRole.RoleReader
	case RoleWriter:
		return accountsRole.RoleWriter
	case RoleMaintainer:
		return accountsRole.RoleMaintainer
	case RoleOwner:
		return accountsRole.RoleOwner
	}
	return accountsRole.RoleType("")
}
