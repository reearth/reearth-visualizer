package policy

import (
	"errors"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

type ID = workspace.PolicyID

var ErrPolicyViolation = errors.New("policy violation")

type WorkspacePolicy struct {
	WorkspaceID                    workspace.ID
	EnableToCreatePrivateProject   bool
	DisableOperationByOverUsedSeat bool
}
