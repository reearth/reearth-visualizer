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
	"github.com/reearth/reearth/server/internal/adapter"
	appmiddleware "github.com/reearth/reearth/server/internal/adapter/middleware"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

func initEcho(ctx context.Context, cfg *ServerConfig) *echo.Echo {
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
	e.Use(
		middleware.Recover(),
		otelecho.Middleware("reearth-visualizer"),
		restAPITracingMiddleware(), // Add detailed REST API tracing
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

	// auth
	authConfig := cfg.Config.JWTProviders()
	log.Infof("auth: config: %#v", authConfig)

	var wrapHandler func(http.Handler) http.Handler
	if cfg.Config.UseMockAuth() {
		log.Infof("Using mock auth for local development")
		wrapHandler = func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				ctx := r.Context()
				// Set the flag for Mock authentication, Mock user will be obtained with attachOpMiddlewar()
				ctx = adapter.AttachMockAuth(ctx, true)
				next.ServeHTTP(w, r.WithContext(ctx))
			})
		}
	} else {
		// Set AuthInfo to context key => adapter.ContextAuthInfo
		wrapHandler = lo.Must(appx.AuthMiddleware(authConfig, adapter.ContextAuthInfo, true))
	}

	e.Use(echo.WrapMiddleware(wrapHandler))

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

	// auth srv
	authServer(ctx, e, &cfg.Config.AuthSrv, cfg.Repos)

	// public apis
	api := e.Group("/api")
	api.GET("/ping", Ping(), privateCache)
	api.GET("/published/:name", PublishedMetadata())
	api.GET("/health", HealthCheck(cfg.Config, "v1.0.0"))
	api.GET("/published_data/:name", PublishedData("", true))
	published := e.Group("/p", PublishedAuthMiddleware())
	published.GET("/:name/data.json", PublishedData("", true))
	published.GET("/:name/", PublishedIndex("", true))
	serveFiles(e, allowedOrigins(cfg), cfg.Gateways.DomainChecker, cfg.Gateways.File)

	// private apis
	if cfg.AccountsAPIClient != nil {
		e.Use(appmiddleware.NewAccountsMiddlewares(&appmiddleware.NewAccountsMiddlewaresParam{
			AccountsClient: cfg.AccountsAPIClient,
		})...)
	}
	e.Use(attachOpMiddleware(cfg))

	apiPrivate := api.Group("", privateCache)
	apiPrivate.POST("/graphql", GraphqlAPI(cfg.Config.GraphQL, gqldev))
	apiPrivate.POST("/signup", Signup())
	log.Infofc(ctx, "auth: config: %#v", cfg.Config.AuthSrv)
	if !cfg.Config.AuthSrv.Disabled {
		apiPrivate.POST("/signup/verify", StartSignupVerify())
		apiPrivate.POST("/signup/verify/:code", SignupVerify())
		apiPrivate.POST("/password-reset", PasswordReset())
	}

	servSplitUploadFiles(e, cfg)
	servSignatureUploadFiles(e, cfg)

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

func restAPITracingMiddleware() echo.MiddlewareFunc {
	tracer := otel.Tracer("reearth-visualizer")

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			routePath := c.Path()
			actualPath := req.URL.Path
			path := routePath
			if path == "" {
				path = actualPath
			}
			if req.Method == "OPTIONS" || actualPath == "/favicon.ico" {
				return next(c)
			}

			spanName := req.Method + " " + path
			ctx, span := tracer.Start(ctx, spanName,
				trace.WithSpanKind(trace.SpanKindInternal),
				trace.WithAttributes(
					attribute.String("component", "rest"),
					attribute.String("http.route", path),
					attribute.String("http.path", actualPath),
					attribute.String("http.method", req.Method),
					attribute.String("http.url", req.URL.Path),
					attribute.String("http.host", req.Host),
					attribute.String("http.scheme", req.URL.Scheme),
				),
			)
			defer span.End()

			if query := req.URL.Query(); len(query) > 0 {
				queryCount := 0
				for key := range query {
					span.SetAttributes(attribute.String("http.query."+key, "present"))
					queryCount++
				}
				span.SetAttributes(attribute.Int("http.query.count", queryCount))
			}

			paramNames := c.ParamNames()
			if len(paramNames) > 0 {
				for _, paramName := range paramNames {
					paramValue := c.Param(paramName)
					if paramValue != "" {
						span.SetAttributes(attribute.String("http.param."+paramName, paramValue))
					}
				}
			}

			c.SetRequest(req.WithContext(ctx))

			err := next(c)

			status := c.Response().Status
			if status == 0 {
				status = 200
			}

			span.SetAttributes(
				attribute.Int("http.status_code", status),
				attribute.Int64("http.response.size", c.Response().Size),
			)

			if err != nil {
				span.RecordError(err)
				span.SetStatus(codes.Error, err.Error())
				log.Warnfc(ctx, "rest: %s %s failed with error: %v", req.Method, path, err)
			} else if status >= 400 {
				span.SetStatus(codes.Error, http.StatusText(status))
				log.Warnfc(ctx, "rest: %s %s returned status %d", req.Method, path, status)
			} else {
				span.SetStatus(codes.Ok, "Request completed successfully")
				log.Infofc(ctx, "rest: %s %s completed successfully (status=%d)", req.Method, path, status)
			}

			return err
		}
	}
}
