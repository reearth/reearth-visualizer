package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
)

type Policy struct {
	repos *repo.Container
}

func NewPolicy(repos *repo.Container) *Policy {
	return &Policy{repos: repos}
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
