package app

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	http1 "github.com/reearth/reearth-backend/internal/adapter/http"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interactor"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
)

func publicAPI(
	ec *echo.Echo,
	r *echo.Group,
	conf *Config,
	repos *repo.Container,
	gateways *gateway.Container,
) {
	controller := http1.NewUserController(interactor.NewUser(repos, gateways, conf.SignupSecret))
	publishedController := http1.NewPublishedController(interactor.NewPublished(repos.Project, gateways.File, ""))

	r.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	})

	r.POST("/signup", func(c echo.Context) error {
		var inp http1.CreateUserInput
		if err := c.Bind(&inp); err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: fmt.Errorf("failed to parse request body: %w", err)}
		}

		output, err := controller.CreateUser(c.Request().Context(), inp)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, output)
	})

	r.GET("/published/:name", func(c echo.Context) error {
		name := c.Param("name")
		if name == "" {
			return echo.ErrNotFound
		}

		res, err := publishedController.Metadata(c.Request().Context(), name)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	})

	r.GET("/published_data/:name", func(c echo.Context) error {
		name := c.Param("name")
		if name == "" {
			return echo.ErrNotFound
		}

		r, err := publishedController.Data(c.Request().Context(), name)
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, "application/json", r)
	})
}

func publishedRoute(
	ec *echo.Echo,
	r *echo.Group,
	conf *Config,
	repos *repo.Container,
	gateways *gateway.Container,
) {
	var i interfaces.Published
	if conf.Published.IndexURL == nil || conf.Published.IndexURL.String() == "" {
		html, err := os.ReadFile("web/published.html")
		if err == nil {
			i = interactor.NewPublished(repos.Project, gateways.File, string(html))
		} else {
			i = interactor.NewPublished(repos.Project, gateways.File, "")
		}
	} else {
		i = interactor.NewPublishedWithURL(repos.Project, gateways.File, conf.Published.IndexURL)
	}
	contr := http1.NewPublishedController(i)

	key := struct{}{}
	auth := middleware.BasicAuthWithConfig(middleware.BasicAuthConfig{
		Validator: func(user string, password string, c echo.Context) (bool, error) {
			md, ok := c.Request().Context().Value(key).(interfaces.ProjectPublishedMetadata)
			if !ok {
				return true, echo.ErrNotFound
			}
			return !md.IsBasicAuthActive || subtle.ConstantTimeCompare([]byte(user), []byte(md.BasicAuthUsername)) == 1 && subtle.ConstantTimeCompare([]byte(password), []byte(md.BasicAuthPassword)) == 1, nil
		},
		Skipper: func(c echo.Context) bool {
			name := c.Param("name")
			if name == "" {
				return true
			}

			md, err := contr.Metadata(c.Request().Context(), name)
			if err != nil {
				return true
			}

			c.SetRequest(c.Request().WithContext(context.WithValue(c.Request().Context(), key, md)))
			return !md.IsBasicAuthActive
		},
	})

	r.GET("/:name/data.json", func(c echo.Context) error {
		r, err := contr.Data(c.Request().Context(), c.Param("name"))
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, "application/json", r)
	}, auth)

	r.GET("/:name/", func(c echo.Context) error {
		index, err := contr.Index(c.Request().Context(), c.Param("name"), &url.URL{
			Scheme: "http",
			Host:   c.Request().Host,
			Path:   c.Request().URL.Path,
		})
		if err != nil {
			return err
		}
		if index == "" {
			return echo.ErrNotFound
		}

		return c.HTML(http.StatusOK, index)
	}, auth)
}
