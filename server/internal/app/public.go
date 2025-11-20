package app

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth/server/internal/adapter"
	http1 "github.com/reearth/reearth/server/internal/adapter/http"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"

	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

func Ping() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	}
}

func Signup(cfg *ServerConfig) echo.HandlerFunc {
	return func(c echo.Context) error {
		var inp http1.SignupInput
		if err := c.Bind(&inp); err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: fmt.Errorf("failed to parse request body: %w", err)}
		}

		ctx := c.Request().Context()

		// Call reearth-accounts service for signup
		if cfg.Config.UseReearthAccountAuth() && cfg.AccountsAPIClient != nil {
			var u *accountsUser.User
			var err error

			// Check if this is OIDC signup (sub is provided)
			if inp.Sub != nil && *inp.Sub != "" {
				// Use SignupOIDC for OIDC-based signup
				secret := ""
				if inp.Secret != nil {
					secret = *inp.Secret
				}
				u, err = cfg.AccountsAPIClient.UserRepo.SignupOIDC(ctx, inp.Name,
					inp.Email, *inp.Sub, secret)
			} else {
				// Use regular Signup for password-based signup
				userID := ""
				if inp.UserID != nil {
					userID = inp.UserID.String()
				}
				workspaceID := ""
				if inp.WorkspaceID != nil {
					workspaceID = inp.WorkspaceID.String()
				}
				secret := ""
				if inp.Secret != nil {
					secret = *inp.Secret
				}
				u, err = cfg.AccountsAPIClient.UserRepo.Signup(ctx, userID, inp.Name,
					inp.Email, inp.Password, secret, workspaceID)
			}

			if err != nil {
				return &echo.HTTPError{Code: http.StatusInternalServerError, Message: fmt.Sprintf("signup failed: %v", err)}
			}

			return c.JSON(http.StatusOK, http1.SignupOutput{
				ID:    u.ID().String(),
				Name:  u.Name(),
				Email: u.Email(),
			})
		}

		uc := adapter.Usecases(ctx)
		controller := http1.NewUserController(uc.User)

		output, err := controller.Signup(ctx, inp)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, output)
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

func MockUser() echo.HandlerFunc {
	return func(c echo.Context) error {
		uc := adapter.Usecases(c.Request().Context())
		controller := http1.NewUserController(uc.User)

		input := http1.SignupInput{
			Username: "Mock User",
			Email:    "mock@example.com",
		}

		output, err := controller.Signup(c.Request().Context(), input)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, output)
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
