package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"

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

func (i *Policy) FetchPolicy(ctx context.Context, ids []policy.ID) ([]*policy.Policy, error) {
	res, err := i.repos.Policy.FindByIDs(ctx, ids)
	return res, err
}

func workspaceMemberCountEnforcer(r *repo.Container) accountinteractor.WorkspaceMemberCountEnforcer {
	return func(ctx context.Context, ws *workspace.Workspace, _ user.List, op *accountusecase.Operator) error {
		policyID := op.Policy(ws.Policy())
		if policyID == nil || *policyID == "" {
			return nil
		}

		policy, err := r.Policy.FindByID(ctx, *policyID)
		if err != nil {
			return err
		}

		if policy == nil {
			return errors.New("invalid policy")
		}

		return policy.EnforceMemberCount(ws.Members().Count() + 1)
	}
}
