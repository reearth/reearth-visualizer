package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"

	accountsInterfaces "github.com/reearth/reearth-accounts/server/pkg/interfaces"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
)

func UsecaseMiddleware(r *repo.Container, g *gateway.Container, ar *accountsRepo.Container, ag *accountgateway.Container, config interactor.ContainerConfig) echo.MiddlewareFunc {
	return ContextMiddleware(func(ctx context.Context) context.Context {
		repos := r

		if op := adapter.AccountsOperator(ctx); op != nil {

			ws := repo.WorkspaceFilterFromOperator(op)
			sc := repo.SceneFilterFromOperator(op)

			// apply filters to repos
			repos = repos.Filtered(
				ws,
				sc,
			)
		}

		// Prepare reearth-accounts repos
		var aur2 *accountsRepo.Container
		if op := adapter.AccountsOperator(ctx); op != nil && ar != nil {
			aur2 = ar.Filtered(accountsRepo.WorkspaceFilterFromOperator(op))
		} else {
			aur2 = ar
		}

		uc := interactor.NewContainer(repos, g, ag, aur2, config)
		ctx = adapter.AttachUsecases(ctx, &uc)

		// Build accountsInterfaces.Container for AttachAccountsUsecases
		var accountsUC *accountsInterfaces.Container
		if aur2 != nil {
			accountsUC = &accountsInterfaces.Container{
				Workspace: uc.AccountsWorkspace,
				User:      uc.AccountsUser,
			}
		}
		ctx = adapter.AttachAccountsUsecases(ctx, accountsUC)

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
