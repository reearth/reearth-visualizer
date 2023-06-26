package memory

import (
	"context"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type Policy struct {
	m util.SyncMap[workspace.PolicyID, *workspace.Policy]
}

func NewPolicy() *Policy {
	return &Policy{}
}

func NewPolicyWith(policies ...*workspace.Policy) *Policy {
	r := NewPolicy()
	for _, p := range policies {
		if p == nil {
			continue
		}
		r.m.Store(p.ID(), p.Clone())
	}
	return r
}

func (r *Policy) FindByID(_ context.Context, id workspace.PolicyID) (*workspace.Policy, error) {
	p, ok := r.m.Load(id)
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return p.Clone(), nil
}

func (r *Policy) FindByIDs(_ context.Context, ids []workspace.PolicyID) ([]*workspace.Policy, error) {
	policies := r.m.LoadAll(ids...)
	slices.SortStableFunc(policies, func(a, b *workspace.Policy) bool {
		return a.ID() < b.ID()
	})
	return util.Map(policies, func(p *workspace.Policy) *workspace.Policy { return p.Clone() }), nil
}
