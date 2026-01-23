package otel

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/compute/metadata"
	"github.com/reearth/reearthx/log"
	"go.opentelemetry.io/contrib/detectors/gcp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
	"go.opentelemetry.io/otel/trace/noop"
	"golang.org/x/oauth2/google"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/oauth"
)

type ExporterType string

const (
	ExporterTypeJaeger ExporterType = "jaeger"
	ExporterTypeGCP    ExporterType = "gcp"
	ExporterTypeOTLP   ExporterType = "otlp"
)

const (
	gcpProjectIDAttribute = "gcp.project_id"
	gcpCloudTraceEndpoint = "telemetry.googleapis.com:443"
)

type OtelServiceName string

const (
	OtelVisualizerServiceName            OtelServiceName = "reearth-visualizer-api"
	OtelVisualizerInternalApiServiceName OtelServiceName = "reearth-visualizer-internal-api"
)

type Config struct {
	Enabled            bool
	Endpoint           string
	ExporterType       ExporterType
	MaxExportBatchSize int
	BatchTimeout       time.Duration
	MaxQueueSize       int

	SamplingRatio float64

	ServiceName OtelServiceName
}

type TracerProvider interface {
	Tracer(name string, options ...trace.TracerOption) trace.Tracer
	Shutdown(ctx context.Context) error
}

type noopTracerProvider struct {
	trace.TracerProvider
}

func (n *noopTracerProvider) Shutdown(ctx context.Context) error {
	return nil
}

func InitTracer(ctx context.Context, cfg *Config) (TracerProvider, error) {
	if !cfg.Enabled {
		log.Infoc(ctx, "OpenTelemetry tracing is disabled")
		return &noopTracerProvider{TracerProvider: noop.NewTracerProvider()}, nil
	}

	if (cfg.ExporterType == ExporterTypeOTLP || cfg.ExporterType == ExporterTypeJaeger) && cfg.Endpoint == "" {
		return nil, fmt.Errorf("OTLP endpoint is required for exporter type %s", cfg.ExporterType)
	}
	var exporter sdktrace.SpanExporter
	var err error

	cfg.ExporterType = "gcp"
	switch cfg.ExporterType {
	case ExporterTypeGCP:
		log.Infoc(ctx, "Initializing GCP Cloud Trace exporter via OTLP")
		exporter, err = createGCPExporter(ctx, cfg)
	case ExporterTypeJaeger:
		log.Infoc(ctx, "Initializing Jaeger exporter via OTLP", "endpoint", cfg.Endpoint)
		exporter, err = createOTLPExporter(ctx, cfg, false)
	case ExporterTypeOTLP:
		log.Infoc(ctx, "Initializing OTLP exporter", "endpoint", cfg.Endpoint)
		exporter, err = createOTLPExporter(ctx, cfg, false)
	default:
		log.Warnc(ctx, "Unknown exporter type, defaulting to OTLP", "type", cfg.ExporterType)
		exporter, err = createOTLPExporter(ctx, cfg, false)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

	res, err := createResource(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	log.Infoc(ctx, fmt.Sprintf("resource attributes: %+v", res.Attributes()))

	sampler := createSampler(cfg)

	// if we want to see the traces in the console, uncomment the following line
	// and comment out the line that creates the stdoutExporter
	// stdoutExporter, _ := stdouttrace.New(stdouttrace.WithPrettyPrint())

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(
			exporter,
			sdktrace.WithMaxExportBatchSize(cfg.MaxExportBatchSize),
			sdktrace.WithBatchTimeout(cfg.BatchTimeout),
			sdktrace.WithMaxQueueSize(cfg.MaxQueueSize),
		),
		// sdktrace.WithSyncer(stdoutExporter),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sampler),
	)

	otel.SetTracerProvider(tp)

	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	log.Infoc(ctx, "OpenTelemetry tracing initialized successfully",
		"endpoint", cfg.Endpoint,
		"exporter", cfg.ExporterType,
		"service", string(cfg.ServiceName),
		"max_export_batch_size", cfg.MaxExportBatchSize,
		"batch_timeout", cfg.BatchTimeout,
		"max_queue_size", cfg.MaxQueueSize,
		"sampling_ratio", cfg.SamplingRatio)

	return tp, nil
}

func createResource(ctx context.Context, cfg *Config) (*resource.Resource, error) {
	baseAttributes := []resource.Option{}

	if cfg.ExporterType == ExporterTypeGCP {
		gcpDetector := gcp.NewDetector()
		if gcpDetector != nil {
			log.Infoc(ctx, "GCP resource detector initialized")
			baseAttributes = append(baseAttributes, resource.WithDetectors(gcpDetector))
		}

		if metadata.OnGCE() {
			if id, err := metadata.ProjectIDWithContext(ctx); err == nil {
				baseAttributes = append(baseAttributes, resource.WithAttributes(
					attribute.String(gcpProjectIDAttribute, id),
				))
			}
		}
	}

	baseAttributes = append(baseAttributes, []resource.Option{
		resource.WithTelemetrySDK(),
		resource.WithAttributes(
			semconv.ServiceName(string(cfg.ServiceName)),
		),
	}...)

	return resource.New(ctx, baseAttributes...)
}

func createSampler(cfg *Config) sdktrace.Sampler {
	if cfg.SamplingRatio < 0 {
		return sdktrace.AlwaysSample()
	}

	if cfg.SamplingRatio == 0 {
		return sdktrace.NeverSample()
	}

	if cfg.SamplingRatio >= 1 {
		return sdktrace.AlwaysSample()
	}

	return sdktrace.TraceIDRatioBased(cfg.SamplingRatio)
}

func createOTLPExporter(ctx context.Context, cfg *Config, useGCPAuth bool) (sdktrace.SpanExporter, error) {
	opts := []otlptracegrpc.Option{
		otlptracegrpc.WithEndpoint(cfg.Endpoint),
	}

	if useGCPAuth {
		creds, err := google.FindDefaultCredentials(ctx, "https://www.googleapis.com/auth/trace.append")
		if err != nil {
			return nil, fmt.Errorf("failed to get GCP credentials: %w", err)
		}

		perRPCCreds := oauth.TokenSource{TokenSource: creds.TokenSource}

		opts = append(opts,
			otlptracegrpc.WithTLSCredentials(credentials.NewClientTLSFromCert(nil, "")),
			otlptracegrpc.WithDialOption(grpc.WithPerRPCCredentials(perRPCCreds)),
		)
	} else {
		opts = append(opts, otlptracegrpc.WithInsecure())
	}

	return otlptracegrpc.New(ctx, opts...)
}

func createGCPExporter(ctx context.Context, cfg *Config) (sdktrace.SpanExporter, error) {
	gcpCfg := &Config{
		Enabled:       true,
		Endpoint:      gcpCloudTraceEndpoint,
		ExporterType:  ExporterTypeGCP,
		SamplingRatio: cfg.SamplingRatio,
	}

	return createOTLPExporter(ctx, gcpCfg, true)
}
