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
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
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

	// tracing with detailed operation tracking
	srv.AroundOperations(detailedOperationTracer())
	srv.AroundResponses(responseTracer())
	srv.AroundFields(fieldTracer())

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
			trace.WithSpanKind(trace.SpanKindInternal),
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

// detailedOperationTracer creates a middleware that traces GraphQL operations with detailed attributes
func detailedOperationTracer() graphql.OperationMiddleware {
	tracer := otel.Tracer("reearth-visualizer")

	return func(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
		opCtx := graphql.GetOperationContext(ctx)
		if opCtx == nil {
			return next(ctx)
		}

		// Extract operation details
		operationName := opCtx.OperationName
		if operationName == "" {
			operationName = "anonymous"
		}

		spanName := "GraphQL " + string(opCtx.Operation.Operation) + " " + operationName

		// Start a new span for the operation (will automatically link to parent from otelecho)
		ctx, span := tracer.Start(ctx, spanName,
			trace.WithSpanKind(trace.SpanKindInternal),
			trace.WithAttributes(
				attribute.String("graphql.operation.name", operationName),
				attribute.String("graphql.operation.type", string(opCtx.Operation.Operation)),
				attribute.String("component", "graphql"),
			),
		)
		defer span.End()

		log.Infofc(ctx, "graphql: starting operation '%s' (traceID=%s, spanID=%s)",
			spanName, span.SpanContext().TraceID(), span.SpanContext().SpanID())

		// Add operation query (truncated if too long)
		query := opCtx.RawQuery
		if len(query) > 1000 {
			query = query[:1000] + "..."
		}
		span.SetAttributes(attribute.String("graphql.operation.query", query))

		// Add variables if present
		if len(opCtx.Variables) > 0 {
			for key := range opCtx.Variables {
				span.SetAttributes(attribute.String("graphql.variable."+key, "present"))
			}
		}

		// Execute the operation
		res := next(ctx)

		return func(ctx context.Context) *graphql.Response {
			response := res(ctx)

			// Record errors
			if response != nil && len(response.Errors) > 0 {
				span.SetStatus(codes.Error, "GraphQL operation returned errors")
				span.SetAttributes(attribute.Int("graphql.errors.count", len(response.Errors)))

				// Add error details
				for i, err := range response.Errors {
					if i < 3 { // Limit to first 3 errors to avoid span bloat
						span.SetAttributes(attribute.String("graphql.error."+string(rune(i)), err.Message))
					}
				}
				log.Warnfc(ctx, "graphql: operation '%s' completed with %d errors", spanName, len(response.Errors))
			} else {
				span.SetStatus(codes.Ok, "GraphQL operation completed successfully")
				log.Infofc(ctx, "graphql: operation '%s' completed successfully", spanName)
			}

			return response
		}
	}
}

// responseTracer creates a middleware that traces response handling
func responseTracer() graphql.ResponseMiddleware {
	return func(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {
		span := trace.SpanFromContext(ctx)

		// Record timing statistics
		response := next(ctx)

		if response != nil {
			// Add response metadata
			if response.Extensions != nil {
				if complexity, ok := response.Extensions["complexity"].(int); ok {
					span.SetAttributes(attribute.Int("graphql.response.complexity", complexity))
				}
			}
		}

		return response
	}
}

// fieldTracer creates a middleware that traces individual field resolvers
func fieldTracer() graphql.FieldMiddleware {
	tracer := otel.Tracer("reearth-visualizer")

	return func(ctx context.Context, next graphql.Resolver) (interface{}, error) {
		fieldCtx := graphql.GetFieldContext(ctx)
		if fieldCtx == nil {
			return next(ctx)
		}

		// Skip tracing for trivial fields (leaf fields without resolvers)
		if fieldCtx.IsResolver {
			objectType := fieldCtx.Object
			fieldName := fieldCtx.Field.Name

			// Create a span for this field resolution
			spanName := objectType + "." + fieldName
			ctx, span := tracer.Start(ctx, spanName,
				trace.WithAttributes(
					attribute.String("graphql.field.name", fieldName),
					attribute.String("graphql.field.type", objectType),
					attribute.String("graphql.field.path", fieldCtx.Path().String()),
					attribute.Bool("graphql.field.is_resolver", fieldCtx.IsResolver),
				),
			)
			defer span.End()

			// Add field arguments if present
			if fieldCtx.Args != nil && len(fieldCtx.Args) > 0 {
				for key := range fieldCtx.Args {
					span.SetAttributes(attribute.String("graphql.field.arg."+key, "present"))
				}
			}

			// Execute the resolver
			res, err := next(ctx)

			// Record error if any
			if err != nil {
				span.RecordError(err)
				span.SetStatus(codes.Error, err.Error())
			} else {
				span.SetStatus(codes.Ok, "Field resolved successfully")
			}

			return res, err
		}

		return next(ctx)
	}
}
