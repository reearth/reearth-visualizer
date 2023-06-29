package app

import (
	"cloud.google.com/go/profiler"
	"github.com/reearth/reearthx/log"
)

func initProfiler(kind string, version string) {
	if kind == "" {
		return
	}

	if kind == "gcp" {
		initGCPProfiler(version)
	}

	log.Infof("profiler: %s initialized\n", kind)
}

func initGCPProfiler(version string) {
	if err := profiler.Start(profiler.Config{
		Service:        "reearth",
		ServiceVersion: version,
	}); err != nil {
		log.Fatalf("failed to init GCP profiler: %v", err)
	}
}
