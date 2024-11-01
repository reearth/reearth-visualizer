package policy

import (
	"fmt"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewPolicy(t *testing.T) {
	opts := Option{
		ID:                    ID("policy"),
		MemberCount:           lo.ToPtr(100),
		PublishedProjectCount: lo.ToPtr(0),
		LayerCount:            nil,
		AssetStorageSize:      nil,
	}
	p := New(opts)
	assert.Equal(t, &Policy{opts: opts}, p)
	assert.NotSame(t, p.opts.MemberCount, opts.MemberCount)
	assert.NotSame(t, p.opts.PublishedProjectCount, opts.PublishedProjectCount)
	assert.Equal(t, ID("policy"), p.ID())
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
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{MemberCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceMemberCount(a)
	})
}

func TestPolicy_EnforceProjectCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{ProjectCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceProjectCount(a)
	})
}

func TestPolicy_EnforcePublishedProjectCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{PublishedProjectCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforcePublishedProjectCount(a)
	})
}

func TestPolicy_EnforceLayerCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{LayerCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceLayerCount(a)
	})
}

func TestPolicy_EnforceAssetStorageSize(t *testing.T) {
	tests := []policyTest[int64]{
		{limit: 0, arg: 0, fail: false},
		{limit: 20000, arg: 19999, fail: false},
		{limit: 20000, arg: 20000, fail: false},
		{limit: 20000, arg: 20001, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int64) Option {
		return Option{AssetStorageSize: lo.ToPtr(d)}
	}, func(p *Policy, a int64) error {
		return p.EnforceAssetStorageSize(a)
	})
}

func TestPolicy_EnforceDatasetSchemaCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{DatasetSchemaCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceDatasetSchemaCount(a)
	})
}

func TestPolicy_EnforceDatasetCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{DatasetCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceDatasetCount(a)
	})
}

func TestPolicy_EnforceNLSLayersCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{NLSLayersCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceNLSLayersCount(a)
	})
}

func TestPolicy_EnforcePageCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{PageCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforcePageCount(a)
	})
}

func TestPolicy_EnforceBlocksCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{BlocksCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceBlocksCount(a)
	})
}

func testPolicy[T any](t *testing.T, tests []policyTest[T], f func(d T) Option, tf func(p *Policy, a T) error) {
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
					assert.Same(t, ErrPolicyViolation, got)
				} else {
					assert.NoError(t, got)
				}
			},
		)
	}
}

func TestPolicy_Clone(t *testing.T) {
	assert.Nil(t, (*Policy)(nil).Clone())
	p := &Policy{
		opts: Option{
			ID:                    ID("x"),
			Name:                  "a",
			ProjectCount:          lo.ToPtr(1),
			MemberCount:           lo.ToPtr(1),
			PublishedProjectCount: lo.ToPtr(1),
			LayerCount:            lo.ToPtr(1),
			AssetStorageSize:      lo.ToPtr(int64(1)),
			DatasetSchemaCount:    lo.ToPtr(1),
			DatasetCount:          lo.ToPtr(1),
			NLSLayersCount:        lo.ToPtr(1),
			PageCount:             lo.ToPtr(1),
			BlocksCount:           lo.ToPtr(1),
		},
	}
	got := p.Clone()
	assert.Equal(t, p, got)
	assert.NotSame(t, p, got)
}
