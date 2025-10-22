package app

import (
	"context"
	"io"
	"os"

	texporter "github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
	jaeger "github.com/uber/jaeger-client-go"
	jaegercfg "github.com/uber/jaeger-client-go/config"
	jaegerlog "github.com/uber/jaeger-client-go/log"
	"github.com/uber/jaeger-lib/metrics"
	"go.opentelemetry.io/contrib/detectors/gcp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
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

func initTracer(ctx context.Context, conf *config.Config) io.Closer {
	switch conf.Tracer {
	case "gcp":
		return initGCPTracer(ctx, conf)
	case "jaeger":
		return initJaegerTracer(conf)
	default:
		return nil
	}
}

func initGCPTracer(ctx context.Context, conf *config.Config) io.Closer {
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
			semconv.ServiceVersionKey.String("1.0.0"),
			semconv.DeploymentEnvironmentKey.String(getEnvironment()),
		),
	)
	if err != nil {
		log.Warnf("failed to detect GCP resources: %v, using default resource", err)
		res, _ = resource.New(ctx,
			resource.WithTelemetrySDK(),
			resource.WithAttributes(
				semconv.ServiceNameKey.String("reearth-visualizer"),
				semconv.ServiceVersionKey.String("1.0.0"),
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
			sdktrace.WithMaxExportBatchSize(100),    // Batch up to 100 spans
			sdktrace.WithBatchTimeout(1*1000000000), // 1 second timeout for faster export
			sdktrace.WithMaxQueueSize(2048),         // Queue up to 2048 spans
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
		return "test"
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
