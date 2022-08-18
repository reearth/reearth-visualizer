package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPolicy_Load(t *testing.T) {
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
