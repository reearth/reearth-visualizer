package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

type Policy struct {
	repos         *repo.Container
	policyChecker gateway.PolicyChecker
}

func NewPolicy(repos *repo.Container, policyChecker gateway.PolicyChecker) *Policy {
	return &Policy{repos: repos, policyChecker: policyChecker}
}

func (i *Policy) GetWorkspacePolicy(ctx context.Context, wsid accountsID.WorkspaceID) (*policy.WorkspacePolicy, error) {
	ws, err := i.repos.Workspace.FindByID(ctx, wsid)
	if err != nil {
		return nil, err
	}

	createPrivateProject, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralPolicyCheckRequest(ws.ID(), project.VisibilityPrivate))
	if err != nil {
		return nil, err
	}

	customDomainCreation, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateCustomDomainCreationCheckRequest(ws.ID()))
	if err != nil {
		return nil, err
	}

	customDomainCount, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateCustomDomainCountCheckRequest(ws.ID()))
	if err != nil {
		return nil, err
	}

	operationAllowed, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralOperationAllowedCheckRequest(ws.ID()))
	if err != nil {
		return nil, err
	}

	return &policy.WorkspacePolicy{
		WorkspaceID:                    wsid,
		EnableToCreatePrivateProject:   createPrivateProject.Allowed,
		EnableCustomDomainCreation:     customDomainCreation.Allowed,
		OverCustomDomainCount:          !customDomainCount.Allowed,
		DisableOperationByOverUsedSeat: !operationAllowed.Allowed,
	}, nil
}
