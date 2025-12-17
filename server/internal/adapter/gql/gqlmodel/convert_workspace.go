package gqlmodel

import (
	"strings"

	workspacepkg "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

func ToWorkspace(w *workspace.Workspace) *Workspace {
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

func ToWorkspaceFromAccounts(w *workspacepkg.Workspace) *Workspace {
	if w == nil {
		return nil
	}

	memberMap := w.Members().Users()
	members := make([]*WorkspaceMember, 0, len(memberMap))
	for u, r := range memberMap {
		members = append(members, &WorkspaceMember{
			UserID: IDFrom(u),
			Role:   ToRole(workspace.Role(r.Role)),
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

func ToRole(r workspace.Role) Role {
	// Handle both lowercase (from domain) and uppercase (from GraphQL API) role values
	switch strings.ToLower(string(r)) {
	case string(workspace.RoleReader):
		return RoleReader
	case string(workspace.RoleWriter):
		return RoleWriter
	case string(workspace.RoleMaintainer):
		return RoleMaintainer
	case string(workspace.RoleOwner):
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
