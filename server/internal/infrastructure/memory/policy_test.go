package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPolicy_FindByID(t *testing.T) {
	p := workspace.NewPolicy(workspace.PolicyOption{
		ID:          workspace.PolicyID("a"),
		MemberCount: lo.ToPtr(1),
	})
	r := NewPolicyWith(p)

	ctx := context.Background()
	got, err := r.FindByID(ctx, workspace.PolicyID("a"))
	assert.Equal(t, p, got)
	assert.NotSame(t, p, got)
	assert.NoError(t, err)

	got, err = r.FindByID(ctx, workspace.PolicyID("x"))
	assert.Nil(t, got)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func TestPolicy_FindByIDs(t *testing.T) {
	p1 := workspace.NewPolicy(workspace.PolicyOption{
		ID:          workspace.PolicyID("a"),
		MemberCount: lo.ToPtr(1),
	})
	p2 := workspace.NewPolicy(workspace.PolicyOption{
		ID:          workspace.PolicyID("b"),
		MemberCount: lo.ToPtr(1),
	})
	r := NewPolicyWith(p1, p2)

	ctx := context.Background()
	got, err := r.FindByIDs(ctx, []workspace.PolicyID{
		workspace.PolicyID("a"),
		workspace.PolicyID("b"),
		workspace.PolicyID("c"),
	})
	assert.Equal(t, []*workspace.Policy{p1, p2}, got)
	assert.NoError(t, err)
}
