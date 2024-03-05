package memory

import (
	"context"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type Policy struct {
	m util.SyncMap[policy.ID, *policy.Policy]
}

func NewPolicy() *Policy {
	return &Policy{}
}

func NewPolicyWith(policies ...*policy.Policy) *Policy {
	r := NewPolicy()
	for _, p := range policies {
		if p == nil {
			continue
		}
		r.m.Store(p.ID(), p.Clone())
	}
	return r
}

func (r *Policy) FindByID(_ context.Context, id policy.ID) (*policy.Policy, error) {
	p, ok := r.m.Load(id)
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return p.Clone(), nil
}

func (r *Policy) FindByIDs(_ context.Context, ids []policy.ID) ([]*policy.Policy, error) {
	policies := r.m.LoadAll(ids...)
	slices.SortStableFunc(policies, func(a, b *policy.Policy) int {
		if a.ID() < b.ID() {
			return -1
		} else if a.ID() > b.ID() {
			return 1
		}
		return 0
	})
	return util.Map(policies, func(p *policy.Policy) *policy.Policy { return p.Clone() }), nil
}
