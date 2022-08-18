package memory

import (
	"context"

	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Policy struct {
	m util.SyncMap[workspace.PolicyID, *workspace.Policy]
}

func NewPolicy() *Policy {
	return &Policy{}
}

func NewPolicyWith(policies []*workspace.Policy) *Policy {
	r := NewPolicy()
	for _, p := range policies {
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
