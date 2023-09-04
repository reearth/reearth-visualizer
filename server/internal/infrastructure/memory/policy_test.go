package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPolicy_FindByID(t *testing.T) {
	p := policy.NewPolicy(policy.Option{
		ID:          policy.ID("a"),
		MemberCount: lo.ToPtr(1),
	})
	r := NewPolicyWith(p)

	ctx := context.Background()
	got, err := r.FindByID(ctx, policy.ID("a"))
	assert.Equal(t, p, got)
	assert.NotSame(t, p, got)
	assert.NoError(t, err)

	got, err = r.FindByID(ctx, policy.ID("x"))
	assert.Nil(t, got)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func TestPolicy_FindByIDs(t *testing.T) {
	p1 := policy.NewPolicy(policy.Option{
		ID:          policy.ID("a"),
		MemberCount: lo.ToPtr(1),
	})
	p2 := policy.NewPolicy(policy.Option{
		ID:          policy.ID("b"),
		MemberCount: lo.ToPtr(1),
	})
	r := NewPolicyWith(p1, p2)

	ctx := context.Background()
	got, err := r.FindByIDs(ctx, []policy.ID{
		policy.ID("a"),
		policy.ID("b"),
		policy.ID("c"),
	})
	assert.Equal(t, []*policy.Policy{p1, p2}, got)
	assert.NoError(t, err)
}
