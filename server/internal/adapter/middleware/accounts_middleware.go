package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	echo "github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/internal"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts/gqlerror"
	"github.com/reearth/reearthx/log"
)

type AccountsMiddlewares []echo.MiddlewareFunc

type NewAccountsMiddlewaresParam struct {
	AccountsClient *accounts.Client
}

func NewAccountsMiddlewares(param *NewAccountsMiddlewaresParam) AccountsMiddlewares {
	return []echo.MiddlewareFunc{
		newAccountsMiddleware(param.AccountsClient),
	}
}

type NewAccountsMiddlewaresMockParam struct {
	TestUserSubject string
	AccountsClient  *accounts.Client
}

var accountsMiddlewareSkipPathsGET = []string{
	"/api/ping",
	"/api/published/",
	"/plugins/",
	"/assets/",
	"/favicon.ico",
}

var accountsMiddlewareSkipPathsPOST = []string{
	"/api/signup",
}

func shouldSkipAccountsMiddleware(method, path string) bool {

	if method == http.MethodGet {
		for _, skipPath := range accountsMiddlewareSkipPathsGET {
			if skipPath == path || strings.HasPrefix(path, skipPath) {
				return true
			}
		}
	}

	if method == http.MethodPost {
		for _, skipPath := range accountsMiddlewareSkipPathsPOST {
			if skipPath == path || strings.HasPrefix(path, skipPath) {
				return true
			}
		}
	}
	return false
}

func newAccountsMiddleware(accountsClient *accounts.Client) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {

			ctx := c.Request().Context()

			if adapter.IsMockAuth(ctx) || shouldSkipAccountsMiddleware(c.Request().Method, c.Request().URL.Path) {
				return next(c)
			}

			authHeader := c.Request().Header.Get("Authorization")
			if authHeader != "" {
				const bearerPrefix = "Bearer "
				if len(authHeader) > len(bearerPrefix) && strings.HasPrefix(authHeader, bearerPrefix) {
					token := authHeader[len(bearerPrefix):]
					ctx = internal.SetContextJWT(ctx, token)
				}
			}

			// TODO: Optimize performance by including necessary user information (userID, email, etc.)
			// directly in the JWT token instead of executing a GQL query on every request.
			// This will eliminate the overhead of making an API call to fetch user data for each request.
			u, err := accountsClient.UserRepo.FindMe(ctx)
			if err != nil {
				if errors.Is(err, gqlerror.ErrUnauthorized) {
					return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized: user not found")
				}
				log.Errorc(ctx, fmt.Errorf("[Accounts Middleware] failed to fetch user: %w", err))
				return echo.NewHTTPError(http.StatusInternalServerError, "server error: failed to fetch user")
			}
			if u == nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized: user not found")
			}

			ctx = internal.SetContextUser(ctx, u)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}
