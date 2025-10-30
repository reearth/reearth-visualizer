package app

import (
	"context"
	"io"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql"
	texporter "github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
	jaeger "github.com/uber/jaeger-client-go"
	jaegercfg "github.com/uber/jaeger-client-go/config"
	jaegerlog "github.com/uber/jaeger-client-go/log"
	"github.com/uber/jaeger-lib/metrics"
	"go.opentelemetry.io/contrib/detectors/gcp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

type gcpTracerCloser struct {
	tp *sdktrace.TracerProvider
}

func (c *gcpTracerCloser) Close() error {
	if c.tp != nil {
		ctx := context.Background()
		if err := c.tp.ForceFlush(ctx); err != nil {
			log.Errorf("tracer: failed to flush spans: %v", err)
		}
		if err := c.tp.Shutdown(ctx); err != nil {
			log.Errorf("tracer: failed to shutdown: %v", err)
			return err
		}
	}
	return nil
}

func initTracer(ctx context.Context, conf *config.Config, version string) io.Closer {
	switch conf.Tracer {
	case "gcp":
		return initGCPTracer(ctx, conf, version)
	case "jaeger":
		return initJaegerTracer(conf)
	default:
		return nil
	}
}

func initGCPTracer(ctx context.Context, conf *config.Config, version string) io.Closer {
	// Create GCP trace exporter
	exporter, err := texporter.New(texporter.WithProjectID(conf.GCPProject))
	if err != nil {
		log.Fatalf("failed to create GCP trace exporter: %v", err)
	}

	// Detect GCP resources (project, instance, etc.)
	res, err := resource.New(ctx,
		resource.WithDetectors(gcp.NewDetector()),
		resource.WithTelemetrySDK(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String("reearth-visualizer"),
			semconv.ServiceVersionKey.String(version),
			semconv.DeploymentEnvironmentKey.String(getEnvironment()),
		),
	)
	if err != nil {
		log.Warnf("failed to detect GCP resources: %v, using default resource", err)

		res, _ = resource.New(ctx,
			resource.WithTelemetrySDK(),
			resource.WithAttributes(
				semconv.ServiceNameKey.String("reearth-visualizer"),
				semconv.ServiceVersionKey.String(version),
				semconv.DeploymentEnvironmentKey.String(getEnvironment()),
			),
		)
	}

	// Create sampler based on configuration
	sampler := sdktrace.ParentBased(sdktrace.TraceIDRatioBased(conf.TracerSample))
	if conf.TracerSample >= 1.0 {
		sampler = sdktrace.AlwaysSample()
	}

	// Create tracer provider with batch span processor
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter,
			sdktrace.WithMaxExportBatchSize(100),   // Batch up to 100 spans
			sdktrace.WithBatchTimeout(time.Second), // 1 second timeout for faster export
			sdktrace.WithMaxQueueSize(2048),        // Queue up to 2048 spans
		),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sampler),
	)

	otel.SetTracerProvider(tp)

	return &gcpTracerCloser{tp: tp}
}

// getEnvironment returns the current deployment environment
func getEnvironment() string {
	env := os.Getenv("REEARTH_ENV")
	if env == "" {
		return "oss"
	}
	return env
}

func initJaegerTracer(conf *config.Config) io.Closer {
	cfg := jaegercfg.Configuration{
		Sampler: &jaegercfg.SamplerConfig{
			Type:  jaeger.SamplerTypeConst,
			Param: conf.TracerSample,
		},
		Reporter: &jaegercfg.ReporterConfig{
			LogSpans: true,
		},
	}

	jLogger := jaegerlog.StdLogger
	jMetricsFactory := metrics.NullFactory

	closer, err := cfg.InitGlobalTracer(
		"Re:Earth",
		jaegercfg.Logger(jLogger),
		jaegercfg.Metrics(jMetricsFactory),
	)

	if err != nil {
		log.Fatalf("Could not initialize jaeger tracer: %s\n", err.Error())
	}

	log.Infof("tracer: initialized jaeger tracer with sample fraction: %g\n", conf.TracerSample)
	return closer
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
