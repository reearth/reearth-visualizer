package policy

import (
	"errors"

	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type ID = accountsWorkspace.PolicyID

var ErrPolicyViolation = errors.New("policy violation")

type WorkspacePolicy struct {
	WorkspaceID                    accountsWorkspace.ID
	EnableToCreatePrivateProject   bool
	EnableCustomDomainCreation     bool
	OverCustomDomainCount          bool
	DisableOperationByOverUsedSeat bool
}
