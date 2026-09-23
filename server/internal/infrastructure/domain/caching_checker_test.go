package domain

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// fakeDomainChecker counts calls so tests can assert whether the cache
// actually skipped the underlying checker.
type fakeDomainChecker struct {
	calls int
	resp  *gateway.DomainCheckResponse
	err   error
}

func (f *fakeDomainChecker) CheckDomain(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	f.calls++
	return f.resp, f.err
}

// TestCachingDomainChecker_AllowedIsCached is a regression test for REL-08:
// repeated asset requests from an already-authorized custom domain used to
// hit the domain checker's full round trip every single time. An allowed
// answer should now be served from cache on the next call.
func TestCachingDomainChecker_AllowedIsCached(t *testing.T) {
	inner := &fakeDomainChecker{resp: &gateway.DomainCheckResponse{Allowed: true}}
	c := NewCachingDomainChecker(inner)

	for range 5 {
		resp, err := c.CheckDomain(context.Background(), gateway.DomainCheckRequest{Domain: "example.com"})
		require.NoError(t, err)
		assert.True(t, resp.Allowed)
	}

	assert.Equal(t, 1, inner.calls, "an already-allowed domain should only hit the underlying checker once")
}

// TestCachingDomainChecker_DeniedIsNeverCached ensures a denial is always
// re-checked, so revoking a domain's authorization takes effect on the very
// next request instead of waiting out a cache window.
func TestCachingDomainChecker_DeniedIsNeverCached(t *testing.T) {
	inner := &fakeDomainChecker{resp: &gateway.DomainCheckResponse{Allowed: false}}
	c := NewCachingDomainChecker(inner)

	for range 3 {
		resp, err := c.CheckDomain(context.Background(), gateway.DomainCheckRequest{Domain: "revoked.example.com"})
		require.NoError(t, err)
		assert.False(t, resp.Allowed)
	}

	assert.Equal(t, 3, inner.calls, "a denial must never be cached")
}

// TestCachingDomainChecker_ErrorIsNeverCached ensures a checker error is
// always retried on the next call rather than being remembered.
func TestCachingDomainChecker_ErrorIsNeverCached(t *testing.T) {
	inner := &fakeDomainChecker{err: errors.New("checker unavailable")}
	c := NewCachingDomainChecker(inner)

	for range 3 {
		_, err := c.CheckDomain(context.Background(), gateway.DomainCheckRequest{Domain: "example.com"})
		assert.Error(t, err)
	}

	assert.Equal(t, 3, inner.calls, "an error must never be cached")
}

// TestCachingDomainChecker_DifferentDomainsAreNotConflated guards against a
// cache keyed incorrectly (e.g. a single shared entry) letting one domain's
// allowed answer leak into another's.
func TestCachingDomainChecker_DifferentDomainsAreNotConflated(t *testing.T) {
	inner := &fakeDomainChecker{resp: &gateway.DomainCheckResponse{Allowed: true}}
	c := NewCachingDomainChecker(inner)

	_, err := c.CheckDomain(context.Background(), gateway.DomainCheckRequest{Domain: "a.example.com"})
	require.NoError(t, err)
	_, err = c.CheckDomain(context.Background(), gateway.DomainCheckRequest{Domain: "b.example.com"})
	require.NoError(t, err)

	assert.Equal(t, 2, inner.calls, "two distinct domains should each hit the underlying checker once")
}
