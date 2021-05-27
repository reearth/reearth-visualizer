package app

import (
	"errors"
	"net/http"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-backend/internal/adapter/graphql"
	err1 "github.com/reearth/reearth-backend/pkg/error"
)

func initAppEcho(cfg *ServerConfig) *echo.Echo {
	e := newEcho(cfg)

	controllers := graphql.NewContainer(cfg.Repos, cfg.Gateways, graphql.ContainerConfig{
		SignupSecret: cfg.Config.SignupSecret,
	})

	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

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
				c.Logger().Errorf("echo internal err: %+v", err2)
			}
		} else if errors.Is(err, err1.ErrNotFound) {
			code = http.StatusNotFound
			msg = "not found"
		} else {
			var ierr *err1.ErrInternal
			if errors.As(err, &ierr) {
				if err2 := ierr.Unwrap(); err2 != nil {
					c.Logger().Errorf("internal err: %+v", err2)
				}
				code = http.StatusInternalServerError
				msg = "internal server error"
			}
		}

		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			e.DefaultHTTPErrorHandler(err, c)
		}
	}

	origins := allowedOrigins(cfg)
	if len(origins) > 0 {
		e.Use(
			middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
			}),
		)
	}

	e.GET("/api/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	})

	if cfg.Debug || cfg.Config.Dev {
		// GraphQL Playground without auth
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-backend", "/api/graphql"),
		))
	}

	e.GET("/api/published/:name", apiPublished(cfg))
	e.GET("/api/published_data/:name", apiPublishedData(cfg))
	api := e.Group("/api")

	privateApi := api.Group("")
	jwks := &JwksSyncOnce{}
	authRequired(privateApi, jwks, cfg)

	publicRoute(e, api, cfg.Config, cfg.Repos, cfg.Gateways)
	graphqlRoute(e, privateApi, cfg, controllers)
	userRoute(e, privateApi, cfg.Repos)

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

func apiPublished(cfg *ServerConfig) echo.HandlerFunc {
	return func(c echo.Context) error {
		name := c.Param("name")
		prj, err := cfg.Repos.Project.FindByPublicName(c.Request().Context(), name)
		if err != nil || prj == nil {
			return echo.ErrNotFound
		}

		title := prj.PublicTitle()
		description := prj.PublicDescription()
		if title == "" {
			title = prj.Name()
		}
		if description == "" {
			description = prj.Description()
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"title":       title,
			"description": description,
			"image":       prj.PublicImage(),
			"noindex":     prj.PublicNoIndex(),
		})
	}
}

func apiPublishedData(cfg *ServerConfig) echo.HandlerFunc {
	return func(c echo.Context) error {
		name := c.Param("name")
		prj, err := cfg.Repos.Project.FindByPublicName(c.Request().Context(), name)
		if err != nil || prj == nil {
			return echo.ErrNotFound
		}

		r, err := cfg.Gateways.File.ReadBuiltSceneFile(c.Request().Context(), prj.PublicName())
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, echo.MIMEApplicationJSON, r)
	}
}
