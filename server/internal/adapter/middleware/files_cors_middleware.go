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
			if allowedOrigin == "" && isFirstPartyPublishedOrigin(origin, publishedHost) {
				allowedOrigin = origin
			}
			if allowedOrigin == "" {
				domain, err := extractDomain(origin)
				if err != nil {
					log.Errorfc(c.Request().Context(), "[FilesCORSMiddleware] extract domain err: %v", err)
					return next(c)
				}
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

// isFirstPartyPublishedOrigin reports whether origin's host matches the
// published-page host pattern (e.g. "{}.visualizer.reearth.io"), i.e. it is one
// of our own published subdomains rather than a third-party custom domain. The
// match is anchored so a look-alike suffix ("...reearth.io.evil.com") cannot pass.
func isFirstPartyPublishedOrigin(origin, publishedHost string) bool {
	if origin == "" || publishedHost == "" || !strings.Contains(publishedHost, "{}") {
		return false
	}
	host, err := extractDomain(origin)
	if err != nil || host == "" {
		return false
	}
	const placeholder = "<>"
	pattern := strings.TrimPrefix(strings.TrimPrefix(publishedHost, "https://"), "http://")
	pattern = strings.ReplaceAll(pattern, "{}", placeholder)
	re, err := regexp.Compile("^" + strings.ReplaceAll(regexp.QuoteMeta(pattern), placeholder, "(.+?)") + "$")
	if err != nil {
		return false
	}
	return re.MatchString(host)
}

func extractDomain(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}

	host := u.Host
	if strings.Contains(host, ":") {
		host = strings.Split(host, ":")[0]
	}

	return host, nil
}
