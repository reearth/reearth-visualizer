package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/util"
)

type PolicyLoader struct {
	usecase interfaces.Policy
}

func NewPolicyLoader(usecase interfaces.Policy) *PolicyLoader {
	return &PolicyLoader{usecase: usecase}
}

func (c *PolicyLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Policy, []error) {
	uids := util.Map(ids, func(i gqlmodel.ID) policy.ID { return policy.ID(i) })
	res, err := c.usecase.FetchPolicy(ctx, uids)
	if err != nil {
		return nil, []error{err}
	}

	return util.Map(res, func(p *policy.Policy) *gqlmodel.Policy {
		return gqlmodel.ToPolicy(p)
	}), nil
}

// data loader

type PolicyDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Policy, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Policy, []error)
}

func (c *PolicyLoader) DataLoader(ctx context.Context) PolicyDataLoader {
	return gqldataloader.NewPolicyLoader(gqldataloader.PolicyLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Policy, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *PolicyLoader) OrdinaryDataLoader(ctx context.Context) PolicyDataLoader {
	return &ordinaryPolicyLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Policy, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryPolicyLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Policy, []error)
}

func (l *ordinaryPolicyLoader) Load(key gqlmodel.ID) (*gqlmodel.Policy, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryPolicyLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Policy, []error) {
	return l.fetch(keys)
}
