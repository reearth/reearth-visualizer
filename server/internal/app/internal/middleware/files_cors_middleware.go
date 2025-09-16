package middleware

import (
	"net/url"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
)

func FilesCORSMiddleware(domainChecker gateway.DomainChecker, allowedOrigins []string) func(echo.HandlerFunc) echo.HandlerFunc {
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
					log.Errorfc(c.Request().Context(), "[FilesCORSMiddleware] domain checker check domain err: %v", err)
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
