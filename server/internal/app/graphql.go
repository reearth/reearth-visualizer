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
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/log"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"golang.org/x/text/language"
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
	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](30),
	})

	// complexity limit
	if conf.ComplexityLimit > 0 {
		srv.Use(extension.FixedComplexityLimit(conf.ComplexityLimit))
	}

	// tracing
	srv.Use(otelgqlgen.Middleware())

	srv.SetErrorPresenter(func(ctx context.Context, e error) *gqlerror.Error {
		defer func() {
			if r := recover(); r != nil {
				log.Errorfc(ctx, "panic recovered in error presenter: %v", r)
				return
			}
		}()
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

// customErrorPresenter handles custom GraphQL error presentation by converting various error types
// into localized GraphQL errors.
func customErrorPresenter(ctx context.Context, e error, devMode bool) *gqlerror.Error {
	var graphqlErr *gqlerror.Error
	var vError *verror.VError
	lang := adapter.Lang(ctx, nil)

	systemError := ""
	if errors.As(e, &vError) {
		if errMsg, ok := vError.ErrMsg[language.Make(lang)]; ok {
			messageText := message.ApplyTemplate(ctx, errMsg.Message, vError.TemplateData, language.Make(lang))
			graphqlErr = &gqlerror.Error{
				Err:     vError,
				Message: messageText,
				Extensions: map[string]interface{}{
					"code":        vError.GetErrCode(),
					"message":     messageText,
					"description": message.ApplyTemplate(ctx, errMsg.Description, vError.TemplateData, language.Make(lang)),
				},
			}
		}
		if vError.Err != nil {
			systemError = vError.Err.Error()
		}
	}

	if graphqlErr == nil {
		graphqlErr = graphql.DefaultErrorPresenter(ctx, e)
		systemError = e.Error()
	}

	if graphqlErr.Extensions == nil {
		graphqlErr.Extensions = make(map[string]interface{})
	}

	if devMode {
		if fieldCtx := graphql.GetFieldContext(ctx); fieldCtx != nil {
			graphqlErr.Path = fieldCtx.Path()
		} else {
			graphqlErr.Path = ast.Path{}
		}

		graphqlErr.Extensions["system_error"] = systemError
	}

	if systemError != "" {
		log.Errorfc(ctx, "system error: %+v", e)
	}

	log.Warnfc(ctx, "graphqlErr: %+v", graphqlErr)

	return graphqlErr
}
