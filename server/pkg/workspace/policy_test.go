package workspace

import (
	"fmt"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewPolicy(t *testing.T) {
	opts := PolicyOption{
		ID:                    PolicyID("policy"),
		MemberCount:           lo.ToPtr(100),
		PublishedProjectCount: lo.ToPtr(0),
		LayerCount:            nil,
		DatasetCount:          nil,
		AssetStorageSize:      nil,
	}
	p := NewPolicy(opts)
	assert.Equal(t, &Policy{opts: opts}, p)
	assert.NotSame(t, p.opts.MemberCount, opts.MemberCount)
	assert.NotSame(t, p.opts.PublishedProjectCount, opts.PublishedProjectCount)
	assert.Equal(t, PolicyID("policy"), p.ID())
}

type policyTest[T any] struct {
	limit     T
	arg       T
	limitNil  bool
	policyNil bool
	fail      bool
}

func TestPolicy_EnforceMemberCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: true},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: true},
		{limit: 1, arg: 2, fail: true},
		{limit: 2, arg: 1, fail: false},
		{limit: 2, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) PolicyOption {
		return PolicyOption{MemberCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceMemberCount(a)
	})
}

func TestPolicy_EnforcePublishedProjectCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: true},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: true},
		{limit: 1, arg: 2, fail: true},
		{limit: 2, arg: 1, fail: false},
		{limit: 2, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) PolicyOption {
		return PolicyOption{PublishedProjectCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforcePublishedProjectCount(a)
	})
}

func TestPolicy_EnforceLayerCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: true},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: true},
		{limit: 1, arg: 2, fail: true},
		{limit: 2, arg: 1, fail: false},
		{limit: 2, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) PolicyOption {
		return PolicyOption{LayerCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceLayerCount(a)
	})
}

func TestPolicy_EnforceDatasetCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: true},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: true},
		{limit: 1, arg: 2, fail: true},
		{limit: 2, arg: 1, fail: false},
		{limit: 2, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) PolicyOption {
		return PolicyOption{DatasetCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceDatasetCount(a)
	})
}

func TestPolicy_EnforceAssetStorageSize(t *testing.T) {
	tests := []policyTest[int64]{
		{limit: 0, arg: 0, fail: true},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: true},
		{limit: 1, arg: 2, fail: true},
		{limit: 20000, arg: 19999, fail: false},
		{limit: 20000, arg: 20000, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int64) PolicyOption {
		return PolicyOption{AssetStorageSize: lo.ToPtr(d)}
	}, func(p *Policy, a int64) error {
		return p.EnforceAssetStorageSize(a)
	})
}

func testPolicy[T any](t *testing.T, tests []policyTest[T], f func(d T) PolicyOption, tf func(p *Policy, a T) error) {
	t.Helper()
	for _, tt := range tests {
		t.Run(
			fmt.Sprintf(
				"policy=%v,limitNil=%t,policyNil=%t,arg=%v,fail=%t",
				tt.limit, tt.limitNil, tt.policyNil, tt.arg, tt.fail,
			),
			func(t *testing.T) {
				var p *Policy
				if !tt.policyNil {
					if !tt.limitNil {
						p = &Policy{opts: f(tt.limit)}
					} else {
						p = &Policy{}
					}
				}

				got := tf(p, tt.arg)
				if tt.fail {
					assert.Same(t, ErrOperationDenied, got)
				} else {
					assert.NoError(t, got)
				}
			},
		)
	}
}
