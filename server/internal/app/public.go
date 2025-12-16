package app

import (
	"context"
	"crypto/subtle"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth/server/internal/adapter"
	http1 "github.com/reearth/reearth/server/internal/adapter/http"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
)

func Ping() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	}
}

func PublishedMetadata() echo.HandlerFunc {
	return func(c echo.Context) error {
		name := c.Param("name")
		if name == "" {
			return rerror.ErrNotFound
		}

		contr, err := publishedController(c)
		if err != nil {
			return err
		}

		res, err := contr.Metadata(c.Request().Context(), name)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func PublishedData(pattern string, useParam bool) echo.HandlerFunc {
	return func(c echo.Context) error {
		alias := resolveAlias(c, pattern, useParam)
		if alias == "" {
			return rerror.ErrNotFound
		}

		contr, err := publishedController(c)
		if err != nil {
			return err
		}

		r, err := contr.Data(c.Request().Context(), alias)
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, "application/json", r)
	}
}

func PublishedIndex(pattern string, useParam bool) echo.HandlerFunc {
	return PublishedIndexMiddleware(pattern, useParam, true)(nil)
}

func WebConfigHandler(authCfg *config.AuthConfig, webCfg map[string]any, published string) echo.HandlerFunc {
	return func(c echo.Context) error {
		cfg := map[string]any{}
		if authCfg != nil {
			if authCfg.ISS != "" {
				cfg["auth0Domain"] = strings.TrimSuffix(authCfg.ISS, "/")
			}
			if authCfg.ClientID != nil {
				cfg["auth0ClientId"] = *authCfg.ClientID
			}
			if len(authCfg.AUD) > 0 {
				cfg["auth0Audience"] = authCfg.AUD[0]
			}
		}
		if published != "" {
			cfg["published"] = published
		}

		for k, v := range webCfg {
			cfg[k] = v
		}

		return c.JSON(http.StatusOK, cfg)
	}
}

func PublishedIndexMiddleware(pattern string, useParam, errorIfNotFound bool) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			contr, err := publishedController(c)
			if err != nil {
				return err
			}

			alias := resolveAlias(c, pattern, useParam)
			if alias == "" && (next != nil || errorIfNotFound) {
				if errorIfNotFound {
					return rerror.ErrNotFound
				}
				if next != nil {
					return next(c)
				}
			}

			index, err := contr.Index(c.Request().Context(), alias, &url.URL{
				Scheme: "http",
				Host:   c.Request().Host,
				Path:   c.Request().URL.Path,
			})
			if err != nil {
				return err
			}
			if index == "" {
				return rerror.ErrNotFound
			}

			return c.HTML(http.StatusOK, index)
		}
	}
}

type keyType struct{}

func PublishedAuthMiddleware() echo.MiddlewareFunc {
	key := keyType{}
	return middleware.BasicAuthWithConfig(middleware.BasicAuthConfig{
		Validator: func(user string, password string, c echo.Context) (bool, error) {
			md, ok := c.Request().Context().Value(key).(interfaces.PublishedMetadata)
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

			contr, err := publishedController(c)
			if err != nil {
				return false
			}

			md, err := contr.Metadata(c.Request().Context(), name)
			if err != nil {
				return true
			}

			c.SetRequest(c.Request().WithContext(context.WithValue(c.Request().Context(), key, md)))
			return !md.IsBasicAuthActive
		},
	})
}

func publishedController(c echo.Context) (*http1.PublishedController, error) {
	uc := adapter.Usecases(c.Request().Context())
	if uc.Published == nil {
		return nil, rerror.ErrNotFound
	}
	return http1.NewPublishedController(uc.Published), nil
}

func resolveAlias(c echo.Context, pattern string, useParam bool) (a string) {
	if useParam {
		a = c.Param("name")
	}
	if a == "" {
		a = getAliasFromHost(c.Request().Host, pattern)
	}
	return
}

func getAliasFromHost(host, pattern string) string {
	if host == "" || pattern == "" || !strings.Contains(pattern, "{}") {
		return ""
	}

	const placeholder = "<>"
	pattern = strings.TrimPrefix(strings.TrimPrefix(pattern, "https://"), "http://")
	pattern = strings.ReplaceAll(pattern, "{}", placeholder)
	re, err := regexp.Compile(strings.ReplaceAll(regexp.QuoteMeta(pattern), placeholder, "(.+?)"))
	if err != nil {
		return ""
	}

	m := re.FindStringSubmatch(host)
	if len(m) <= 1 {
		return ""
	}

	return m[1]
}
