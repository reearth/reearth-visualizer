package app

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/gql"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/log"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"golang.org/x/text/language"

	accountsGQLclient "github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
)

const (
	enableDataLoaders = true
	maxUploadSize     = 10 * 1024 * 1024 * 1024 // 10GB
	maxMemorySize     = 100 * 1024 * 1024       // 100MB
)

func GraphqlAPI(conf config.GraphQLConfig, accountsAPIClient *accountsGQLclient.Client, accountsAPIHost string, accountRepos *accountsInfra.Container, dev bool) echo.HandlerFunc {

	schema := gql.NewExecutableSchema(gql.Config{
		Resolvers: gql.NewResolver(accountsAPIClient, accountsAPIHost, accountRepos),
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

	// tracing with detailed operation tracking
	srv.AroundOperations(detailedOperationTracer())
	srv.AroundResponses(responseTracer())
	// srv.AroundFields(fieldTracer())

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
		tracer := otel.Tracer("reearth-visualizer")
		ctx, span := tracer.Start(ctx, "GraphQL Handler",
			trace.WithSpanKind(trace.SpanKindServer),
			trace.WithAttributes(
				attribute.String("component", "graphql"),
				attribute.String("http.method", req.Method),
				attribute.String("http.url", req.URL.Path),
				attribute.String("handler", "graphql"),
			),
		)
		defer span.End()

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

	if normalized := normalizeAccountsErrorMessage(graphqlErr.Message); normalized != "" {
		graphqlErr.Message = normalized
		if graphqlErr.Extensions != nil {
			if _, ok := graphqlErr.Extensions["message"]; ok {
				graphqlErr.Extensions["message"] = normalized
			}
		}
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

func normalizeAccountsErrorMessage(msg string) string {
	lower := strings.ToLower(msg)
	switch {
	case strings.Contains(lower, "alias") && strings.Contains(lower, "already") && strings.Contains(lower, "workspace"):
		return "alias is already used in another workspace"
	case strings.Contains(lower, "alias") && strings.Contains(lower, "already"):
		return "alias is already used in another workspace"
	case !strings.Contains(lower, "message: input:"):
		return ""
	case strings.Contains(lower, "operation denied"):
		return "operation denied"
	case strings.Contains(lower, "not found"):
		return "not found"
	}
	return ""
}
