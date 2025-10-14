package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	echo "github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter/internal"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts"
	"github.com/reearth/reearthx/log"
)

type AccountsMiddlewares []echo.MiddlewareFunc

type NewAccountsMiddlewaresParam struct {
	AccountsClient *accounts.Client
}

func NewAccountsMiddlewares(param *NewAccountsMiddlewaresParam) AccountsMiddlewares {
	return []echo.MiddlewareFunc{
		jwtContextMiddleware(),
		newAccountsMiddleware(param.AccountsClient),
	}
}

type NewAccountsMiddlewaresMockParam struct {
	TestUserSubject string
	AccountsClient  *accounts.Client
}

func NewTempNewAuthMiddlewaresMock(param *NewAccountsMiddlewaresMockParam) AccountsMiddlewares {
	return []echo.MiddlewareFunc{
		echo.WrapMiddleware(func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				ctx := r.Context()
				ctx = context.WithValue(ctx, jwtmiddleware.ContextKey{}, &validator.ValidatedClaims{
					RegisteredClaims: validator.RegisteredClaims{
						Subject: param.TestUserSubject,
					},
				})
				r = r.WithContext(ctx)
				next.ServeHTTP(w, r)
			})
		}),
		newAccountsMiddleware(param.AccountsClient),
	}
}

func jwtContextMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader != "" {
				// Remove the "Bearer " prefix from the Authorization header to extract the token
				const bearerPrefix = "Bearer "
				if len(authHeader) > len(bearerPrefix) && authHeader[:len(bearerPrefix)] == bearerPrefix {
					token := authHeader[len(bearerPrefix):]
					ctx := internal.SetContextJWT(c.Request().Context(), token)
					c.SetRequest(c.Request().WithContext(ctx))
				}
			}
			return next(c)
		}
	}
}

func newAccountsMiddleware(accountsClient *accounts.Client) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()

			// TODO: Optimize performance by including necessary user information (userID, email, etc.)
			// directly in the JWT token instead of executing a GQL query on every request.
			// This will eliminate the overhead of making an API call to fetch user data for each request.
			u, err := accountsClient.UserRepo.FindMe(ctx)
			if err != nil {
				if strings.Contains(err.Error(), "401") {
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
