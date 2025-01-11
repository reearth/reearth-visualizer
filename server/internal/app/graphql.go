package app

import (
	"context"
	"errors"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/labstack/echo/v4"
	"github.com/ravilushqa/otelgqlgen"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/apperror"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const (
	enableDataLoaders = true
	maxUploadSize     = 10 * 1024 * 1024 * 1024 // 10GB
	maxMemorySize     = 100 * 1024 * 1024       // 100MB
)

func GraphqlAPI(conf config.GraphQLConfig, dev bool) echo.HandlerFunc {

	schema := gql.NewExecutableSchema(gql.Config{
		Resolvers: gql.NewResolver(),
	})

	srv := handler.New(schema)

	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
	})
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{
		MaxUploadSize: maxUploadSize,
		MaxMemory:     maxMemorySize,
	})

	// cache settings
	srv.SetQueryCache(lru.New(1000))
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(30),
	})

	// complexity limit
	if conf.ComplexityLimit > 0 {
		srv.Use(extension.FixedComplexityLimit(conf.ComplexityLimit))
	}

	// tracing
	srv.Use(otelgqlgen.Middleware())

	srv.SetErrorPresenter(
		// show more detailed error messgage in debug mode
		func(ctx context.Context, e error) *gqlerror.Error {
			var graphqlErr *gqlerror.Error
			var appErr *apperror.AppError
			lang := adapter.Lang(ctx)
			if ok := errors.As(e, &appErr); ok {
				localesErr := appErr.LocalesError[lang]
				graphqlErr = &gqlerror.Error{
					Message: localesErr.Message,
					Extensions: map[string]interface{}{
						"code":        localesErr.Code,
						"description": localesErr.Description,
					},
				}
			} else {
				graphqlErr = graphql.DefaultErrorPresenter(ctx, e)
			}

			if dev {
				graphqlErr.Path = graphql.GetFieldContext(ctx).Path()
			}

			// FixMe: system error should not be shown to user
			systemError := ""
			if graphqlErr.Err != nil {
				systemError = graphqlErr.Err.Error()
			} else {
				systemError = e.Error()
			}

			if graphqlErr.Extensions == nil {
				graphqlErr.Extensions = make(map[string]interface{})
			}

			graphqlErr.Extensions["system_error"] = systemError

			return graphqlErr
		},
	)

	// only enable middlewares in dev mode
	if dev {
		srv.Use(extension.Introspection{})
	}

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
