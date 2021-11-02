package app

import (
	"context"
	"errors"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo/v4"
	"github.com/ravilushqa/otelgqlgen"
	"github.com/reearth/reearth-backend/internal/adapter/gql"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const enableDataLoaders = true

func dataLoaderMiddleware(container gql.Loaders) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(echoCtx echo.Context) error {
			req := echoCtx.Request()
			ctx := req.Context()

			ctx = context.WithValue(ctx, gql.DataLoadersKey(), container.DataLoadersWith(ctx, enableDataLoaders))
			echoCtx.SetRequest(req.WithContext(ctx))
			return next(echoCtx)
		}
	}
}

func tracerMiddleware(enabled bool) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(echoCtx echo.Context) error {
			if !enabled {
				return next(echoCtx)
			}
			req := echoCtx.Request()
			ctx := req.Context()
			t := &gql.Tracer{}
			echoCtx.SetRequest(req.WithContext(gql.AttachTracer(ctx, t)))
			defer t.Print()
			return next(echoCtx)
		}
	}
}

func graphqlAPI(
	ec *echo.Echo,
	r *echo.Group,
	conf *ServerConfig,
	usecases interfaces.Container,
) {
	playgroundEnabled := conf.Debug || conf.Config.Dev
	controllers := gql.NewLoaders(usecases)

	if playgroundEnabled {
		r.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-backend", "/api/graphql"),
		))
	}

	schema := gql.NewExecutableSchema(gql.Config{
		Resolvers: gql.NewResolver(controllers, conf.Debug),
	})

	srv := handler.NewDefaultServer(schema)
	srv.Use(otelgqlgen.Middleware())
	if conf.Config.GraphQL.ComplexityLimit > 0 {
		srv.Use(extension.FixedComplexityLimit(conf.Config.GraphQL.ComplexityLimit))
	}
	if playgroundEnabled {
		srv.Use(extension.Introspection{})
	}
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(30),
	})
	srv.SetErrorPresenter(
		// show more detailed error messgage in debug mode
		func(ctx context.Context, e error) *gqlerror.Error {
			if conf.Debug {
				var ierr *rerror.ErrInternal
				if errors.As(e, &ierr) {
					if err2 := ierr.Unwrap(); err2 != nil {
						// TODO: display stacktrace with xerrors
						ec.Logger.Errorf("%+v", err2)
					}
				}
				return gqlerror.ErrorPathf(graphql.GetFieldContext(ctx).Path(), e.Error())
			}
			return graphql.DefaultErrorPresenter(ctx, e)
		},
	)

	r.POST("/graphql", func(c echo.Context) error {
		srv.ServeHTTP(c.Response(), c.Request())
		return nil
	}, dataLoaderMiddleware(controllers), tracerMiddleware(false))
}
