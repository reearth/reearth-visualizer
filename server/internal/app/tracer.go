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
	"go.opentelemetry.io/otel"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(ctx context.Context, conf *config.Config) io.Closer {
	if conf.Tracer == "gcp" {
		initGCPTracer(ctx, conf)
	} else if conf.Tracer == "jaeger" {
		return initJaegerTracer(conf)
	}
	return nil
}

func initGCPTracer(ctx context.Context, conf *config.Config) {
	exporter, err := texporter.New(texporter.WithProjectID(conf.GCPProject))
	if err != nil {
		log.Fatalf("failed to init GCP tracer: %v", err)
	}

	tp := sdktrace.NewTracerProvider(sdktrace.WithSyncer(exporter), sdktrace.WithSampler(sdktrace.TraceIDRatioBased(conf.TracerSample)))
	defer func() {
		_ = tp.ForceFlush(ctx)
	}()

	otel.SetTracerProvider(tp)

	log.Infof("tracer: initialized cloud trace with sample fraction: %g", conf.TracerSample)
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
