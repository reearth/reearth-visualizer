package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
)

func AssetsCORSMiddleware(domainChecker gateway.DomainChecker, allowedOrigins []string) func(echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			origin := c.Request().Header.Get("Origin")
			if origin == "" {
				return c.NoContent(http.StatusBadRequest)
			}
			allowedOrigin := ""
			for _, allowed := range allowedOrigins {
				if allowed == origin {
					allowedOrigin = allowed
					break
				}
			}
			if allowedOrigin == "" {
				log.Infofc(c.Request().Context(), "domain checker check domain: %s", origin)
				domainResp, err := domainChecker.CheckDomain(c.Request().Context(), gateway.DomainCheckRequest{
					Domain: origin,
				})
				log.Infofc(c.Request().Context(), "domain checker check domain resp: %v", domainResp)
				if err != nil {
					log.Errorfc(c.Request().Context(), "domain checker check domain err: %v", err)
					return next(c)
				}
				if domainResp.Allowed {
					c.Response().Header().Set("Access-Control-Allow-Origin", origin)
				}
			} else {
				c.Response().Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			}

			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "*")
			c.Response().Header().Set("Access-Control-Max-Age", "86400")

			if c.Request().Method == "OPTIONS" {
				return c.NoContent(http.StatusNoContent)
			}

			return next(c)
		}
	}
}
