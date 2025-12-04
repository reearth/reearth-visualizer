package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
)

type Policy struct {
	repos         *repo.Container
	policyChecker gateway.PolicyChecker
}

func NewPolicy(repos *repo.Container, policyChecker gateway.PolicyChecker) *Policy {
	return &Policy{repos: repos, policyChecker: policyChecker}
}

func (i *Policy) GetWorkspacePolicy(ctx context.Context, wsid accountdomain.WorkspaceID) (*policy.WorkspacePolicy, error) {
	ws, err := i.repos.Workspace.FindByID(ctx, wsid)
	if err != nil {
		return nil, err
	}

	createPrivateProject, err := i.policyChecker.CheckPolicy(ctx, gateway.CreateGeneralPolicyCheckRequest(ws.ID(), project.VisibilityPrivate))

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
		DisableOperationByOverUsedSeat: !operationAllowed.Allowed,
	}, nil
}

func workspaceMemberCountEnforcer(r *repo.Container) accountinteractor.WorkspaceMemberCountEnforcer {
	return func(ctx context.Context, ws *workspace.Workspace, _ user.List, op *accountusecase.Operator) error {
		return nil
	}
}
