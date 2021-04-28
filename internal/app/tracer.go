package app

import (
	"io"

	texporter "github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace"
	"github.com/reearth/reearth-backend/pkg/log"
	jaeger "github.com/uber/jaeger-client-go"
	jaegercfg "github.com/uber/jaeger-client-go/config"
	jaegerlog "github.com/uber/jaeger-client-go/log"
	"github.com/uber/jaeger-lib/metrics"
	"go.opentelemetry.io/otel/api/global"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(conf *Config) io.Closer {
	if conf.Tracer == "gcp" {
		initGCPTracer(conf)
	} else if conf.Tracer == "jaeger" {
		return initJaegerTracer(conf)
	}
	return nil
}

func initGCPTracer(conf *Config) {
	exporter, err := texporter.NewExporter(texporter.WithProjectID(conf.GCPProject))
	if err != nil {
		log.Fatalln(err)
	}

	tp, err := sdktrace.NewProvider(sdktrace.WithConfig(sdktrace.Config{
		DefaultSampler: sdktrace.ProbabilitySampler(conf.TracerSample),
	}), sdktrace.WithSyncer(exporter))
	if err != nil {
		log.Fatalln(err)
	}

	global.SetTraceProvider(tp)

	log.Infof("tracer: initialized cloud trace with sample fraction: %g", conf.TracerSample)
}

func initJaegerTracer(conf *Config) io.Closer {
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
