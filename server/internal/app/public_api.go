package app

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

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
		// Import chunks are 16MiB, so only the import route takes more than 10MB.
		middleware.BodyLimitWithConfig(middleware.BodyLimitConfig{Limit: "10M", Skipper: isImportRoute}),
		middleware.BodyLimitWithConfig(middleware.BodyLimitConfig{Limit: "17M", Skipper: func(c echo.Context) bool { return !isImportRoute(c) }}),
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
	apiv1.RegisterHandlers(v1, apiv1.NewHandler(apiv1.Config{
		PublishedHost: cfg.Config.Published.Host,
		File:          cfg.Gateways.File,
		Importer:      newAPIImporter(),
	}))

	e.Any("/*", func(c echo.Context) error { return echo.NewHTTPError(http.StatusNotFound) })

	log.Infofc(ctx, "server: public API mode: serving /api/v1 only")
	return e
}

func isImportRoute(c echo.Context) bool {
	return c.Request().Method == http.MethodPost && strings.HasSuffix(c.Request().URL.Path, "/projects/import")
}

// newAPIImporter imports through the same chunked upload as the web app's
// /api/split-import, with its own upload sessions and import workers in this
// process.
func newAPIImporter() apiv1.Importer {
	m := newSplitUploadManager(os.TempDir(), apiv1.ImportChunkSize)
	m.StartCleanupRoutine(1 * time.Hour)

	return func(ctx context.Context, chunk apiv1.ImportChunk) (apiv1.ImportChunkResult, error) {
		if err := validateChunkRequest(chunk.FileID, chunk.ChunkNum, chunk.TotalChunks); err != nil {
			return apiv1.ImportChunkResult{}, echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		res, err := m.handleChunkedUpload(ctx, adapter.Usecases(ctx), adapter.Operator(ctx),
			chunk.WorkspaceID, chunk.FileID, chunk.ChunkNum, chunk.TotalChunks, chunkFile{bytes.NewReader(chunk.Data)})
		if err != nil {
			return apiv1.ImportChunkResult{}, err
		}
		r, ok := res.(map[string]interface{})
		if !ok {
			return apiv1.ImportChunkResult{}, fmt.Errorf("unexpected upload result %T", res)
		}
		out := apiv1.ImportChunkResult{}
		out.ProjectID, _ = r["project_id"].(string)
		out.Received, _ = r["received"].(int)
		out.Total, _ = r["total"].(int)
		out.Completed, _ = r["completed"].(bool)
		return out, nil
	}
}

// chunkFile adapts a chunk held in memory to the multipart.File that the
// chunked upload takes.
type chunkFile struct{ *bytes.Reader }

func (chunkFile) Close() error { return nil }
