package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/repo"

	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
)

func UsecaseMiddleware(
	r *repo.Container,
	g *gateway.Container,
	ar *accountsRepo.Container,
	ag *accountsGateway.Container,
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

		var ar2 *accountsRepo.Container
		if op := adapter.AccountsOperator(ctx); op != nil && ar != nil {
			// apply filters to repos
			ar2 = ar.Filtered(accountsRepo.WorkspaceFilterFromOperator(op))
		} else {
			ar2 = ar
		}

		uc := interactor.NewContainer(repos, g, ar2, ag, config)
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
