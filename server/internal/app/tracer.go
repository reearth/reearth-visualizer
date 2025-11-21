package app

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearthx/log"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

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
			trace.WithSpanKind(trace.SpanKindServer),
			trace.WithAttributes(
				attribute.String("graphql.operation.name", operationName),
				attribute.String("graphql.operation.type", string(opCtx.Operation.Operation)),
				attribute.String("component", "graphql"),
			),
		)
		defer span.End()

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
