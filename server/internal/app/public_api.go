package app

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/apiv1"
	appmiddleware "github.com/reearth/reearth/server/internal/adapter/middleware"
	"github.com/reearth/reearth/server/internal/app/otel"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
)

// initPublicAPIEcho builds the server for the public API mode
// (Visualizer.PublicApi.Active). It serves only /api/v1 and the health
// endpoints: no GraphQL, imports, file serving or web app. It runs as its own
// deployment so that API clients such as the CLI never share the main
// server's capacity, while using the same auth, usecases and database.
func initPublicAPIEcho(ctx context.Context, cfg *ServerConfig, otelServiceName otel.OtelServiceName) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalf("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true
	e.HTTPErrorHandler = apiv1.ErrorHandler

	logger := log.NewEcho()
	e.Logger = logger
	if cfg.Config.OtelEnabled {
		log.Infof("OpenTelemetry tracing enabled for %s", string(otelServiceName))
		e.Use(otel.Middleware(string(otelServiceName)))
	}
	e.Use(
		middleware.Recover(),
		appmiddleware.RestAPITracingMiddleware(),
		echo.WrapMiddleware(appx.RequestIDMiddleware()),
		logger.AccessLogger(),
		middleware.Gzip(),
		middleware.BodyLimit("10M"),
	)
	if origins := allowedOrigins(cfg); len(origins) > 0 {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{AllowOrigins: origins}))
	}
	if cfg.Config.UseMockAuth() {
		log.Infof("[Auth] Demo User Mode")
		e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				c.SetRequest(c.Request().WithContext(adapter.AttachMockAuth(c.Request().Context(), true)))
				return next(c)
			}
		})
	}

	api := e.Group("/api")
	api.GET("/ping", Ping(), privateCache)
	api.GET("/health", HealthCheck(cfg.Config, "v1.0.0"))

	v1 := api.Group("/v1", privateCache)
	if cfg.Config.UseMockAuth() {
		v1.Use(attachOpMiddlewareMockUser(cfg))
	} else {
		v1.Use(attachOpMiddlewareReearthAccounts(cfg))
	}
	v1.Use(
		apiv1.RequireOperator,
		// Built after auth, so that the repos are filtered by the operator (SEC-01).
		newUsecaseMiddleware(cfg, ""),
		AttachLanguageMiddleware,
	)
	apiv1.RegisterHandlers(v1, apiv1.NewHandler())

	e.Any("/*", func(c echo.Context) error { return echo.NewHTTPError(http.StatusNotFound) })

	log.Infofc(ctx, "server: public API mode: serving /api/v1 only")
	return e
}
