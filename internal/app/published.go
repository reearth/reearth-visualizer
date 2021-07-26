package app

import (
	"context"
	"crypto/subtle"
	"io"
	"io/fs"
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

func publishedRoute(
	ec *echo.Echo,
	r *echo.Group,
	conf *Config,
	repos *repo.Container,
	gateways *gateway.Container,
) {
	contr := http1.NewPublishedController(publishedUsecaseFrom(conf.Published.IndexURL, repos.Project, gateways.File, os.DirFS(".")))
	auth := PublishedAuthMiddleware(contr.Metadata)
	r.GET("/:name/data.json", PublishedData(contr.Data), auth)
	r.GET("/:name/", PublishedIndex(contr.Index), auth)
}

func PublishedData(data func(ctx context.Context, name string) (io.Reader, error)) echo.HandlerFunc {
	return func(c echo.Context) error {
		r, err := data(c.Request().Context(), c.Param("name"))
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, "application/json", r)
	}
}

func PublishedIndex(index func(ctx context.Context, name string, url *url.URL) (string, error)) echo.HandlerFunc {
	return func(c echo.Context) error {
		index, err := index(c.Request().Context(), c.Param("name"), &url.URL{
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
	}
}

func PublishedAuthMiddleware(metadata func(ctx context.Context, name string) (interfaces.ProjectPublishedMetadata, error)) echo.MiddlewareFunc {
	key := struct{}{}
	return middleware.BasicAuthWithConfig(middleware.BasicAuthConfig{
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

			md, err := metadata(c.Request().Context(), name)
			if err != nil {
				return true
			}

			c.SetRequest(c.Request().WithContext(context.WithValue(c.Request().Context(), key, md)))
			return !md.IsBasicAuthActive
		},
	})
}

func publishedUsecaseFrom(indexURL *url.URL, p repo.Project, f gateway.File, ff fs.FS) interfaces.Published {
	var i interfaces.Published
	if indexURL == nil || indexURL.String() == "" {
		html, err := fs.ReadFile(ff, "web/published.html")
		if err == nil {
			i = interactor.NewPublished(p, f, string(html))
		} else {
			i = interactor.NewPublished(p, f, "")
		}
	} else {
		i = interactor.NewPublishedWithURL(p, f, indexURL)
	}
	return i
}
