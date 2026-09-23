package domain

import (
	"context"
	"time"

	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

// cachedAllowedTTL bounds how long a domain's "allowed" answer is reused
// without re-checking. Kept short, so revoking a domain's access is never
// delayed by more than this window; a hot published map's per-asset CORS
// checks are still spared the checker's full round trip for that window.
const cachedAllowedTTL = 30 * time.Second

// cachedAllowedSize bounds how many distinct domains are held at once. Well
// above any realistic number of custom domains in active use at one time.
const cachedAllowedSize = 4096

// CachingDomainChecker wraps a DomainChecker with a short-lived cache of only
// its "allowed" answers. A denial, a cache miss, or an error always goes to
// the underlying checker -- only a still-authorized domain's repeated checks
// are skipped. This means removing a domain's authorization takes effect on
// the very next request instead of waiting out a cache window; the cache
// only ever makes an already-allowed domain's checks cheaper.
type CachingDomainChecker struct {
	inner gateway.DomainChecker
	cache *expirable.LRU[string, struct{}]
}

func NewCachingDomainChecker(inner gateway.DomainChecker) *CachingDomainChecker {
	return &CachingDomainChecker{
		inner: inner,
		cache: expirable.NewLRU[string, struct{}](cachedAllowedSize, nil, cachedAllowedTTL),
	}
}

func (c *CachingDomainChecker) CheckDomain(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	if _, ok := c.cache.Get(req.Domain); ok {
		return &gateway.DomainCheckResponse{Allowed: true}, nil
	}

	resp, err := c.inner.CheckDomain(ctx, req)
	if err != nil {
		return resp, err
	}
	if resp != nil && resp.Allowed {
		c.cache.Add(req.Domain, struct{}{})
	}
	return resp, nil
}
