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
	"github.com/vektah/gqlparser/v2/ast"
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

	srv.SetErrorPresenter(func(ctx context.Context, e error) *gqlerror.Error {
		return customErrorPresenter(ctx, e, dev)
	})

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

// customErrorPresenter handles custom GraphQL error presentation.
func customErrorPresenter(ctx context.Context, e error, devMode bool) *gqlerror.Error {
	var graphqlErr *gqlerror.Error
	var appErr *apperror.AppError
	lang := adapter.Lang(ctx)

	// Handle application-specific errors
	systemError := ""
	if errors.As(e, &appErr) {
		localesErr, ok := appErr.LocalesError[lang]
		if ok {
			graphqlErr = &gqlerror.Error{
				Err:     appErr.SystemError,
				Message: localesErr.Message,
				Extensions: map[string]interface{}{
					"code":        localesErr.Code,
					"description": localesErr.Description,
				},
			}
			if graphqlErr.Err != nil {
				systemError = graphqlErr.Err.Error()
			}
		}
	}

	if graphqlErr == nil {
		// Fallback to default GraphQL error presenter
		graphqlErr = graphql.DefaultErrorPresenter(ctx, e)
		systemError = e.Error()
	}

	// Add debugging information in development mode
	if devMode {
		if fieldCtx := graphql.GetFieldContext(ctx); fieldCtx != nil {
			graphqlErr.Path = fieldCtx.Path()
		} else {
			graphqlErr.Path = ast.Path{}
		}
		graphqlErr.Extensions["system_error"] = systemError
	}

	// Ensure Extensions map exists
	if graphqlErr.Extensions == nil {
		graphqlErr.Extensions = make(map[string]interface{})
	}

	return graphqlErr
}
