package app

import (
	"context"
	"io"

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
		return c.tp.Shutdown(ctx)
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
		),
	)
	if err != nil {
		log.Warnf("failed to detect GCP resources: %v, using default resource", err)
		res, _ = resource.New(ctx,
			resource.WithTelemetrySDK(),
			resource.WithAttributes(
				semconv.ServiceNameKey.String("reearth-visualizer"),
			),
		)
	}

	// Create tracer provider with batch span processor for better performance
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sdktrace.TraceIDRatioBased(conf.TracerSample)),
	)

	otel.SetTracerProvider(tp)

	log.Infof("tracer: initialized GCP Cloud Trace (project=%s, sample=%g)", conf.GCPProject, conf.TracerSample)

	return &gcpTracerCloser{tp: tp}
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
