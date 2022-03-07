package app

import (
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/adapter"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
)

func UsecaseMiddleware(uc *interfaces.Container) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			ctx = adapter.AttachUsecases(ctx, uc)

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}
