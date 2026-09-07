package app

import (
	"context"
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
				return echo.ErrBadRequest
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
			fmt.Printf("[export] download file: %s \n", filename)

			// Close the reader before removing the object so the delete never races an
			// open handle, and so the connection is released as soon as streaming ends.
			streamErr := c.Stream(http.StatusOK, "application/zip", r)
			_ = r.Close()
			if streamErr != nil {
				return streamErr
			}

			// The export zip is a single-use handoff: once the client has downloaded it,
			// remove it from storage so it does not linger. A bucket lifecycle policy backs
			// this up for downloads that never complete. Use a detached context because the
			// request context is being torn down as the response finishes. A genuine delete
			// failure is already logged at ERROR by the gateway (an already-removed object is
			// treated as success), so a real failure surfaces on the error alert.
			_ = fileGateway.RemoveExportProjectZip(context.WithoutCancel(ctx), filename)

			return nil
		},
		// privateCache must be first: Echo composes middleware so the last one in this list
		// runs closest to the handler, which would let optionalAuth short-circuit (e.g. a bad
		// Authorization header) without this ever running. Listed first, it's outermost and
		// always sets the header, even on responses rejected before reaching the handler.
		privateCache,
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
