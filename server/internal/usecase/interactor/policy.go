package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/policy"
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
