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
	"github.com/reearth/reearth-backend/internal/usecase/interactor"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
)

func initEcho(ctx context.Context, cfg *ServerConfig) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalln("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)

	// basic middleware
	logger := GetEchoLogger()
	e.Logger = logger
	e.Use(
		logger.Hook(),
		middleware.Recover(),
		otelecho.Middleware("reearth-backend"),
	)
	origins := allowedOrigins(cfg)
	if len(origins) > 0 {
		e.Use(
			middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
			}),
		)
	}

	e.Use(
		jwtEchoMiddleware(cfg),
		parseJwtMiddleware(),
		authMiddleware(cfg),
	)

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
	if cfg.Debug || cfg.Config.Dev {
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-backend", "/api/graphql"),
		))
	}

	// init usecases
	var publishedIndexHTML string
	if cfg.Config.Published.IndexURL == nil || cfg.Config.Published.IndexURL.String() == "" {
		if html, err := fs.ReadFile(os.DirFS("."), "web/published.html"); err == nil {
			publishedIndexHTML = string(html)
		}
	}

	e.Use(UsecaseMiddleware(cfg.Repos, cfg.Gateways, interactor.ContainerConfig{
		SignupSecret:       cfg.Config.SignupSecret,
		PublishedIndexHTML: publishedIndexHTML,
		PublishedIndexURL:  cfg.Config.Published.IndexURL,
		AuthSrvUIDomain:    cfg.Config.AuthSrv.UIDomain,
	}))

	// auth srv
	if !cfg.Config.AuthSrv.Disabled {
		auth := e.Group("")
		authEndPoints(ctx, e, auth, cfg)
	}

	// apis
	api := e.Group("/api")
	api.GET("/ping", Ping())
	if !cfg.Config.AuthSrv.Disabled {
		api.POST("/signup", Signup())
		api.POST("/signup/verify", StartSignupVerify())
		api.POST("/signup/verify/:code", SignupVerify())
		api.POST("/password-reset", PasswordReset())
	}
	api.GET("/published/:name", PublishedMetadata())
	api.GET("/published_data/:name", PublishedData())

	// authenticated endpoints
	privateApi := api.Group("", AuthRequiredMiddleware())
	graphqlAPI(e, privateApi, cfg)
	privateAPI(e, privateApi, cfg.Repos)

	published := e.Group("/p", PublishedAuthMiddleware())
	published.GET("/:name/data.json", PublishedData())
	published.GET("/:name/", PublishedIndex())

	serveFiles(e, cfg.Gateways.File)
	web(e, cfg.Config.Web, cfg.Config.Auths())

	return e
}

func errorHandler(next func(error, echo.Context)) func(error, echo.Context) {
	return func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			c.Echo().Logger.Errorf(f, args...)
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
		origins = append(origins, "http://localhost:3000", "http://localhost:8080")
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
