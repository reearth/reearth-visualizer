package app

import (
	"errors"
	"net/http"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-backend/internal/adapter/graphql"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"github.com/reearth/reearth-backend/pkg/log"
	echotracer "go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo"
)

func initEcho(cfg *ServerConfig) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalln("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true

	logger := GetEchoLogger()
	e.Logger = logger
	e.Use(logger.Hook())
	e.Use(middleware.Recover(), echotracer.Middleware("reearth-backend"))

	origins := allowedOrigins(cfg)
	if len(origins) > 0 {
		e.Use(
			middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
			}),
		)
	}

	if e.Debug {
		// enable pprof
		e.GET("/debug/pprof/*", echo.WrapHandler(http.DefaultServeMux))
	}

	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			c.Echo().Logger.Errorf(f, args...)
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			e.DefaultHTTPErrorHandler(err, c)
		}
	}

	if cfg.Debug || cfg.Config.Dev {
		// GraphQL Playground without auth
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-backend", "/api/graphql"),
		))
	}

	api := e.Group("/api")
	publicAPI(e, api, cfg.Config, cfg.Repos, cfg.Gateways)
	jwks := &JwksSyncOnce{}
	privateApi := api.Group("")
	authRequired(privateApi, jwks, cfg)
	graphqlAPI(e, privateApi, cfg, graphql.NewContainer(cfg.Repos, cfg.Gateways, graphql.ContainerConfig{
		SignupSecret: cfg.Config.SignupSecret,
	}))
	privateAPI(e, privateApi, cfg.Repos)

	published := e.Group("/p")
	publishedRoute(e, published, cfg.Config, cfg.Repos, cfg.Gateways)

	serveFiles(e, cfg.Gateways.File)
	web(e, cfg.Config.Web, cfg.Config.Auth0)

	return e
}

func authRequired(g *echo.Group, jwks Jwks, cfg *ServerConfig) {
	g.Use(jwtEchoMiddleware(jwks, cfg))
	g.Use(parseJwtMiddleware(cfg))
	g.Use(authMiddleware(cfg))
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
	} else if errors.Is(err, err1.ErrNotFound) {
		code = http.StatusNotFound
		msg = "not found"
	} else {
		var ierr *err1.ErrInternal
		if errors.As(err, &ierr) {
			if err2 := ierr.Unwrap(); err2 != nil {
				log("internal err: %+v", err2)
			}
			code = http.StatusInternalServerError
			msg = "internal server error"
		}
	}

	return code, msg
}
