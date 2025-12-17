package app

import (
	"context"
	"errors"
	"io/fs"
	"net/http"
	"net/http/pprof"
	"os"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	appmiddleware "github.com/reearth/reearth/server/internal/adapter/middleware"
	"github.com/reearth/reearth/server/internal/app/otel"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

func initEcho(
	ctx context.Context,
	cfg *ServerConfig,
	otelServiceName otel.OtelServiceName,
) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalf("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)

	// basic middleware
	logger := log.NewEcho()
	e.Logger = logger
	if cfg.Config.OtelEnabled {
		log.Infof("OpenTelemetry tracing enabled for %s", string(otelServiceName))
		e.Use(otel.Middleware(string(otelServiceName)))
	} else {
		log.Infof("OpenTelemetry tracing disabled for %s", string(otelServiceName))
	}

	e.Use(
		middleware.Recover(),
		appmiddleware.RestAPITracingMiddleware(), // Add detailed REST API tracing
		echo.WrapMiddleware(appx.RequestIDMiddleware()),
		logger.AccessLogger(),
		middleware.Gzip(),
	)
	if cfg.Config.HTTPSREDIRECT {
		e.Use(middleware.HTTPSRedirectWithConfig(middleware.RedirectConfig{
			Code: http.StatusTemporaryRedirect,
		}))
	}
	origins := allowedOrigins(cfg)
	if len(origins) > 0 {
		e.Use(
			middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
			}),
		)
	}

	// enable pprof
	if e.Debug {
		pprofGroup := e.Group("/debug/pprof")
		pprofGroup.Any("/cmdline", echo.WrapHandler(http.HandlerFunc(pprof.Cmdline)))
		pprofGroup.Any("/profile", echo.WrapHandler(http.HandlerFunc(pprof.Profile)))
		pprofGroup.Any("/symbol", echo.WrapHandler(http.HandlerFunc(pprof.Symbol)))
		pprofGroup.Any("/trace", echo.WrapHandler(http.HandlerFunc(pprof.Trace)))
		pprofGroup.Any("/*", echo.WrapHandler(http.HandlerFunc(pprof.Index)))
	}

	// GraphQL Playground without auth
	gqldev := cfg.Debug || cfg.Config.Dev
	if gqldev {
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth", "/api/graphql"),
		))
		log.Infofc(ctx, "gql: GraphQL Playground is available")
	}

	// init usecases
	var publishedIndexHTML string
	if cfg.Config.Published.IndexURL == nil || cfg.Config.Published.IndexURL.String() == "" {
		if html, err := fs.ReadFile(os.DirFS("."), "web/published.html"); err == nil {
			favicon := ""
			if cfg.Config.Web_FaviconURL != "" && !cfg.Config.Web_Disabled {
				favicon = "/favicon.ico"
			}
			publishedIndexHTML = rewriteHTML(string(html), cfg.Config.Web_Title, favicon)
		}
	}

	e.Use(
		UsecaseMiddleware(
			cfg.Repos,
			cfg.Gateways,
			cfg.AccountRepos,
			cfg.AccountGateways,
			interactor.ContainerConfig{
				SignupSecret:       cfg.Config.SignupSecret,
				PublishedIndexHTML: publishedIndexHTML,
				PublishedIndexURL:  cfg.Config.Published.IndexURL,
				AuthSrvUIDomain:    cfg.Config.Host_Web,
			},
		),
	)

	e.Use(AttachLanguageMiddleware)

	// public apis
	apiRoot := e.Group("/api")
	apiRoot.GET("/ping", Ping(), privateCache)
	apiRoot.GET("/health", HealthCheck(cfg.Config, "v1.0.0"))

	// Asset API for handling GCP files
	serveFiles(e, allowedOrigins(cfg), cfg.Gateways.DomainChecker, cfg.Gateways.File)

	apiPrivateRoute := apiRoot.Group("", privateCache)
	apiPrivateRoute.Use(attachOpMiddlewareReearthAccounts(cfg))

	// Main backend API
	apiPrivateRoute.POST("/graphql", GraphqlAPI(cfg.Config.GraphQL, cfg.AccountsAPIClient, gqldev))

	// Registering an initial user (for local development)
	apiPrivateRoute.POST("/signup", Signup(cfg))

	// Project Import API direct upload version
	servSplitUploadFiles(apiPrivateRoute, cfg) // /split-import
	// Project Import API using GCP trriger version
	servSignatureUploadFiles(
		apiRoot,         // for /api/import-project
		apiPrivateRoute, // for /api/signature-url
		cfg,
	)

	(&WebHandler{
		Disabled:    cfg.Config.Web_Disabled,
		AppDisabled: cfg.Config.Web_App_Disabled,
		WebConfig:   cfg.Config.WebConfig(),
		AuthConfig:  cfg.Config.AuthForWeb(),
		HostPattern: cfg.Config.Published.Host,
		Title:       cfg.Config.Web_Title,
		FaviconURL:  cfg.Config.Web_FaviconURL,
		FS:          nil,
	}).Handler(e)

	return e
}

func errorHandler(next func(error, echo.Context)) func(error, echo.Context) {
	return func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

		if errors.Is(err, echo.ErrNotFound) {
			err = rerror.ErrNotFound
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			log.Errorfc(c.Request().Context(), f, args...)
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			next(err, c)
		}
	}
}

func allowedOrigins(cfg *ServerConfig) []string {
	if cfg == nil {
		return nil
	}
	origins := append([]string{}, cfg.Config.Origins...)
	if cfg.Debug {
		origins = append(origins, "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080")
	}
	return origins
}

func errorMessage(err error, log func(string, ...interface{})) (int, string) {
	code := http.StatusBadRequest
	msg := err.Error()

	if err2, ok := err.(*echo.HTTPError); ok {
		code = err2.Code
		if msg2, ok := err2.Message.(string); ok {
			msg = msg2
		} else if msg2, ok := err2.Message.(error); ok {
			msg = msg2.Error()
		} else {
			msg = "error"
		}
		if err2.Internal != nil {
			log("echo internal err: %+v", err2)
		}
	} else if errors.Is(err, rerror.ErrNotFound) {
		code = http.StatusNotFound
		msg = "not found"
	} else {
		if ierr := rerror.UnwrapErrInternal(err); ierr != nil {
			code = http.StatusInternalServerError
			msg = "internal server error"
		}
	}

	return code, msg
}

func privateCache(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderCacheControl, "private, no-store, no-cache, must-revalidate")
		return next(c)
	}
}
