package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	infraCerbos "github.com/reearth/reearth/server/internal/infrastructure/cerbos"
	infraRedis "github.com/reearth/reearth/server/internal/infrastructure/redis"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
)

func UsecaseMiddleware(
	r *repo.Container,
	g *gateway.Container,
	ar *accountrepo.Container,
	ag *accountgateway.Container,
	redisAdapter *infraRedis.RedisAdapter,
	cerbosAdapter *infraCerbos.CerbosAdapter,
	config interactor.ContainerConfig,
) echo.MiddlewareFunc {
	return ContextMiddleware(func(ctx context.Context) context.Context {
		repos := r

		if op := adapter.Operator(ctx); op != nil {

			ws := repo.WorkspaceFilterFromOperator(op)
			sc := repo.SceneFilterFromOperator(op)

			// apply filters to repos
			repos = repos.Filtered(
				ws,
				sc,
			)
		}

		var ar2 *accountrepo.Container
		if op := adapter.AcOperator(ctx); op != nil && ar != nil {
			// apply filters to repos
			ar2 = ar.Filtered(accountrepo.WorkspaceFilterFromOperator(op))
		} else {
			ar2 = ar
		}

		uc := interactor.NewContainer(repos, g, ar2, ag, redisAdapter, cerbosAdapter, config)
		ctx = adapter.AttachUsecases(ctx, &uc)
		return ctx
	})
}

func ContextMiddleware(fn func(ctx context.Context) context.Context) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			c.SetRequest(req.WithContext(fn(req.Context())))
			return next(c)
		}
	}
}
