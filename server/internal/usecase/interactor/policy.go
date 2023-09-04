package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountusecase"
)

type Policy struct {
	repos *repo.Container
}

func NewPolicy(r *repo.Container) interfaces.Policy {
	return &Policy{
		repos: r,
	}
}

func (i *Policy) FetchPolicy(ctx context.Context, ids []policy.ID, operator *accountusecase.Operator) ([]*policy.Policy, error) {
	return i.repos.Policy.FindByIDs(ctx, ids)
}
