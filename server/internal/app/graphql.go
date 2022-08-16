package app

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/labstack/echo/v4"
	"github.com/ravilushqa/otelgqlgen"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const enableDataLoaders = true

func GraphqlAPI(
	conf GraphQLConfig,
	dev bool,
) echo.HandlerFunc {
	schema := gql.NewExecutableSchema(gql.Config{
		Resolvers: gql.NewResolver(),
	})

	srv := handler.NewDefaultServer(schema)
	srv.Use(otelgqlgen.Middleware())

	if conf.ComplexityLimit > 0 {
		srv.Use(extension.FixedComplexityLimit(conf.ComplexityLimit))
	}

	if dev {
		srv.Use(extension.Introspection{})
	}

	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(30),
	})

	srv.SetErrorPresenter(
		// show more detailed error messgage in debug mode
		func(ctx context.Context, e error) *gqlerror.Error {
			if dev {
				return gqlerror.ErrorPathf(graphql.GetFieldContext(ctx).Path(), e.Error())
			}
			return graphql.DefaultErrorPresenter(ctx, e)
		},
	)

	return func(c echo.Context) error {
		req := c.Request()
		ctx := req.Context()

		usecases := adapter.Usecases(ctx)
		ctx = gql.AttachUsecases(ctx, usecases, enableDataLoaders)
		c.SetRequest(req.WithContext(ctx))

		srv.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}
