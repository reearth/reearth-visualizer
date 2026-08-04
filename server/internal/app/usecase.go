package app

import (
	"context"

	"github.com/labstack/echo/v4"
	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
)

func UsecaseMiddleware(r *repo.Container, g *gateway.Container, ar *accountsInfra.Container, ag *accountsGateway.Container, config interactor.ContainerConfig) echo.MiddlewareFunc {
	return ContextMiddleware(func(ctx context.Context) context.Context {
		uc := BuildUsecases(ctx, r, g, ar, ag, config)
		ctx = adapter.AttachUsecases(ctx, &uc)
		return ctx
	})
}

// BuildUsecases builds the usecase container, filtering repos to whatever operator is
// already on ctx. Exported so callers that attach an operator to ctx after this middleware
// has already run once -- e.g. SecurityHandler, which builds its operator from a Pub/Sub push
// payload well after the request enters the app -- can rebuild the container with that
// operator's filters actually applied (SEC-02 shares its root cause with SEC-01: a usecase
// container captured before the operator exists is never filtered).
func BuildUsecases(ctx context.Context, r *repo.Container, g *gateway.Container, ar *accountsInfra.Container, ag *accountsGateway.Container, config interactor.ContainerConfig) interfaces.Container {
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

	var ar2 *accountsInfra.Container
	if op := adapter.AcOperator(ctx); op != nil && ar != nil {
		// apply filters to repos
		ar2 = ar.Filtered(accountsWorkspace.WorkspaceFilterFromOperator(op))
	} else {
		ar2 = ar
	}

	return interactor.NewContainer(repos, g, ar2, ag, config)
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
