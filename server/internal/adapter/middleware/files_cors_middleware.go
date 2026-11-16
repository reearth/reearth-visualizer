package middleware

import (
	"context"
	"errors"
	"net/url"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
)

func FilesCORSMiddleware(domainChecker gateway.DomainChecker, allowedOrigins []string, publishedHost string) func(echo.HandlerFunc) echo.HandlerFunc {
	// Compile the first-party published-host matcher once per middleware
	// instance rather than on every request (asset downloads are a hot path).
	firstPartyMatcher := firstPartyPublishedMatcher(publishedHost)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			origin := c.Request().Header.Get("Origin")

			allowedOrigin := ""
			for _, allowed := range allowedOrigins {
				if allowed == origin {
					allowedOrigin = allowed
					break
				}
			}
			// First-party published subdomains are served by us on a DNS zone we
			// control; they are not third-party custom domains, so allow them
			// directly instead of asking the domain checker (which always answers
			// "no" for them).
			if allowedOrigin == "" && originMatchesFirstParty(firstPartyMatcher, origin) {
				allowedOrigin = origin
			}
			if allowedOrigin == "" {
				domain, err := extractDomain(origin)
				if err != nil {
					log.Errorfc(c.Request().Context(), "[FilesCORSMiddleware] extract domain err: %v", err)
					return next(c)
				}
				// NOTE(REL-06, AI compliance scan finding): CheckDomain is an
				// uncached, synchronous HTTP call (30s default timeout) on every
				// third-party-custom-domain asset request, with no circuit
				// breaker. Root cause investigated; not fixed yet. Checked prod
				// traffic (90-day window): the vast majority of asset requests hit
				// the cached first-party-subdomain path above and never reach this
				// call, so real exposure is low today, but it would degrade badly
				// if the domain-check service itself got slow. Flagged across
				// multiple monthly AI compliance scans (most recently as REL-06 in
				// eukarya-inc/compliance#263); each scan opens a fresh issue, so
				// this comment is the durable record of the investigation.
				domainResp, err := domainChecker.CheckDomain(c.Request().Context(), gateway.DomainCheckRequest{
					Domain: domain,
				})
				if err != nil {
					// A cancelled request is the client giving up, not a server fault.
					if !errors.Is(err, context.Canceled) {
						log.Errorfc(c.Request().Context(), "[FilesCORSMiddleware] domain checker check domain err: %v", err)
					}
					return next(c)
				}
				if domainResp.Allowed {
					allowedOrigin = origin
				}
			}

			if allowedOrigin != "" {
				c.Response().Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				c.Response().Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
				c.Response().Header().Set("Access-Control-Allow-Headers", "*")
				c.Response().Header().Set("Access-Control-Max-Age", "86400")
			}

			return next(c)
		}
	}
}

// firstPartyPublishedMatcher compiles a matcher for our own published-page host
// pattern (e.g. "{}.visualizer.reearth.io"). It returns nil when publishedHost
// is unset or has no "{}" placeholder, which disables the first-party shortcut.
// The pattern is anchored so a look-alike suffix ("...reearth.io.evil.com")
// cannot pass.
func firstPartyPublishedMatcher(publishedHost string) *regexp.Regexp {
	if publishedHost == "" || !strings.Contains(publishedHost, "{}") {
		return nil
	}
	const placeholder = "<>"
	pattern := strings.TrimPrefix(strings.TrimPrefix(publishedHost, "https://"), "http://")
	pattern = strings.ReplaceAll(pattern, "{}", placeholder)
	re, err := regexp.Compile("^" + strings.ReplaceAll(regexp.QuoteMeta(pattern), placeholder, "(.+?)") + "$")
	if err != nil {
		return nil
	}
	return re
}

// originMatchesFirstParty reports whether origin's host matches the precompiled
// published-page matcher, i.e. it is one of our own published subdomains rather
// than a third-party custom domain.
func originMatchesFirstParty(matcher *regexp.Regexp, origin string) bool {
	if matcher == nil || origin == "" {
		return false
	}
	host, err := extractDomain(origin)
	if err != nil || host == "" {
		return false
	}
	return matcher.MatchString(host)
}

func extractDomain(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}

	// Hostname strips the port and unwraps IPv6 brackets (e.g. "[::1]:3000" -> "::1").
	return u.Hostname(), nil
}
