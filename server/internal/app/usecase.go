package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"

	accountsInterfaces "github.com/reearth/reearth-accounts/server/pkg/interfaces"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
)

func UsecaseMiddleware(r *repo.Container, g *gateway.Container, ar *accountrepo.Container, ag *accountgateway.Container, aur *accountsRepo.Container, config interactor.ContainerConfig) echo.MiddlewareFunc {
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

		// Prepare reearth-accounts repos
		var aur2 *accountsRepo.Container
		if op := adapter.AccountsOperator(ctx); op != nil && aur != nil {
			aur2 = aur.Filtered(accountsRepo.WorkspaceFilterFromOperator(op))
		} else {
			aur2 = aur
		}

		uc := interactor.NewContainer(repos, g, ar2, ag, aur2, config)
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
