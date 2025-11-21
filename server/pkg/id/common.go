package id

//===============================================
// This file is a temporary ID conversion utility for the migration to reearth-accounts.
//===============================================

import (
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/idx"

	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

var ErrInvalidID = idx.ErrInvalidID

func ChangeWorkspaceID_AccountsToReearthx(wsIDs []accountsWorkspace.ID) []accountdomain.WorkspaceID {
	ids := make([]accountdomain.WorkspaceID, 0, len(wsIDs))
	for _, id := range wsIDs {
		wid, err := accountdomain.WorkspaceIDFrom(id.String())
		if err != nil {
			continue
		}
		ids = append(ids, wid)
	}
	return ids
}

func ChangeWorkspaceID_ReearthxToAccounts(wsIDs []accountdomain.WorkspaceID) []accountsWorkspace.ID {
	ids := make([]accountsWorkspace.ID, 0, len(wsIDs))
	for _, id := range wsIDs {
		sid := id.String()
		wid, err := accountsWorkspace.IDFrom(sid)
		if err != nil {
			continue
		}
		ids = append(ids, wid)
	}
	return ids
}
