package app

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	appmiddleware "github.com/reearth/reearth/server/internal/adapter/middleware"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/id"
)

func serveExportFile(
	e *echo.Echo,
	cfg *ServerConfig,
	allowedOrigins []string,
	domainChecker gateway.DomainChecker,
	fileGateway gateway.File,
) {
	if fileGateway == nil {
		return
	}

	// Optional auth: attach operator if a valid token is present, silently continue without one if not.
	optionalAuth := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ") == "" {
				return next(c)
			}
			if cfg.Config.UseMockAuth() {
				return attachOpMiddlewareMockUser(cfg)(next)(c)
			}
			return attachOpMiddlewareReearthAccounts(cfg)(next)(c)
		}
	}

	e.GET(
		"/export/:filename",
		func(c echo.Context) error {
			filename := c.Param("filename")
			ctx := c.Request().Context()

			projectIDStr := strings.TrimSuffix(filename, ".zip")
			pid, err := id.ProjectIDFrom(projectIDStr)
			if err != nil {
				return echo.ErrNotFound
			}

			uc := adapter.Usecases(ctx)
			op := adapter.Operator(ctx)
			if _, err := uc.Project.CheckProjectExportAccess(ctx, pid, op); err != nil {
				return err
			}

			r, err := fileGateway.ReadExportProjectZip(ctx, filename)
			if err != nil {
				fmt.Printf("[export] !!!! download error: %s \n", filename)
				return err
			}
			defer r.Close()
			fmt.Printf("[export] download file: %s \n", filename)

			return c.Stream(http.StatusOK, "application/zip", r)
		},
		optionalAuth,
		appmiddleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)

	e.OPTIONS(
		"/export/:filename",
		func(c echo.Context) error {
			return c.NoContent(http.StatusNoContent)
		},
		appmiddleware.FilesCORSMiddleware(domainChecker, allowedOrigins),
	)
}
