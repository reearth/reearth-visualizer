package policy

import (
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type ID = accountsWorkspace.PolicyID

var ErrPolicyViolation = errors.New("policy violation")

type WorkspacePolicy struct {
	WorkspaceID                    accountsID.WorkspaceID
	EnableToCreatePrivateProject   bool
	DisableOperationByOverUsedSeat bool
}
