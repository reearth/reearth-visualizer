package middleware

import (
	echo "github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter/internal"
	"github.com/reearth/reearth/server/internal/infrastructure/accounts"
)

type AccountsMiddlewares []echo.MiddlewareFunc

type NewAccountsMiddlewaresParam struct {
	AccountsClient *accounts.Client
}

func NewAccountsMiddlewares(param *NewAccountsMiddlewaresParam) AccountsMiddlewares {
	return []echo.MiddlewareFunc{
		jwtContextMiddleware(),
	}
}

type NewAccountsMiddlewaresMockParam struct {
	TestUserSubject string
	AccountsClient  *accounts.Client
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
