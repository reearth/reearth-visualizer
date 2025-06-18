package policy

import (
	"fmt"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewPolicy(t *testing.T) {
	opts := Option{
		ID:                ID("policy"),
		CustomDomainCount: lo.ToPtr(100),
		PrivateProject:    lo.ToPtr(false),
		AssetStorageSize:  nil,
	}
	p := New(opts)
	assert.Equal(t, &Policy{opts: opts}, p)
	assert.NotSame(t, p.opts.CustomDomainCount, opts.CustomDomainCount)
	assert.NotSame(t, p.opts.PrivateProject, opts.PrivateProject)
	assert.Equal(t, ID("policy"), p.ID())
}

type policyTest[T any] struct {
	limit     T
	arg       T
	limitNil  bool
	policyNil bool
	fail      bool
}

func TestPolicy_EnforceCustomDomainCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{CustomDomainCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceCustomDomainCount(a)
	})
}

func TestPolicy_EnforceAssetStorageSize(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 20000, arg: 19999, fail: false},
		{limit: 20000, arg: 20000, fail: false},
		{limit: 20000, arg: 20001, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{AssetStorageSize: lo.ToPtr(int64(d))}
	}, func(p *Policy, a int) error {
		return p.EnforceAssetStorageSize(int64(a))
	})
}

func TestPolicy_EnforceMaximumSizePerAsset(t *testing.T) {
	tests := []policyTest[int64]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1000, arg: 999, fail: false},
		{limit: 1000, arg: 1000, fail: false},
		{limit: 1000, arg: 1001, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int64) Option {
		return Option{MaximumSizePerAsset: lo.ToPtr(d)}
	}, func(p *Policy, a int64) error {
		return p.EnforceMaximumSizePerAsset(a)
	})
}

func TestPolicy_EnforceProjectImportingTimeout(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 300, arg: 299, fail: false},
		{limit: 300, arg: 300, fail: false},
		{limit: 300, arg: 301, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{ProjectImportingTimeout: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceProjectImportingTimeout(a)
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

func TestPolicy_EnforcePublishableCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{PublishableCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforcePublishableCount(a)
	})
}

func TestPolicy_EnforceInstallPluginCount(t *testing.T) {
	tests := []policyTest[int]{
		{limit: 0, arg: 0, fail: false},
		{limit: 1, arg: 0, fail: false},
		{limit: 1, arg: 1, fail: false},
		{limit: 1, arg: 2, fail: true},
		{limitNil: true, arg: 100, fail: false},
		{policyNil: true, arg: 100, fail: false},
	}

	testPolicy(t, tests, func(d int) Option {
		return Option{InstallPluginCount: lo.ToPtr(d)}
	}, func(p *Policy, a int) error {
		return p.EnforceInstallPluginCount(a)
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

func TestPolicy_EnforcePrivateProject(t *testing.T) {
	tests := []struct {
		limit     bool
		arg       bool
		limitNil  bool
		policyNil bool
		fail      bool
	}{
		{limit: true, arg: true, fail: false},     // プライベート許可、プライベート要求 -> OK
		{limit: true, arg: false, fail: false},    // プライベート許可、パブリック要求 -> OK
		{limit: false, arg: false, fail: false},   // プライベート禁止、パブリック要求 -> OK
		{limit: false, arg: true, fail: true},     // プライベート禁止、プライベート要求 -> NG
		{limitNil: true, arg: true, fail: false},  // 制限なし -> OK
		{limitNil: true, arg: false, fail: false}, // 制限なし -> OK
		{policyNil: true, arg: true, fail: false}, // ポリシーなし -> OK
	}

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
						p = &Policy{opts: Option{PrivateProject: lo.ToPtr(tt.limit)}}
					} else {
						p = &Policy{}
					}
				}

				got := p.EnforcePrivateProject(tt.arg)
				if tt.fail {
					assert.Same(t, ErrPolicyViolation, got)
				} else {
					assert.NoError(t, got)
				}
			},
		)
	}
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
			ID:                      ID("x"),
			Name:                    "a",
			PrivateProject:          lo.ToPtr(true),
			CustomDomainCount:       lo.ToPtr(1),
			AssetStorageSize:        lo.ToPtr(int64(1)),
			MaximumSizePerAsset:     lo.ToPtr(int64(1)),
			ProjectImportingTimeout: lo.ToPtr(1),
			ProjectCount:            lo.ToPtr(1),
			PublishableCount:        lo.ToPtr(1),
			InstallPluginCount:      lo.ToPtr(1),
			NLSLayersCount:          lo.ToPtr(1),
		},
	}
	got := p.Clone()
	assert.Equal(t, p, got)
	assert.NotSame(t, p, got)
}
