package app

import (
	"cloud.google.com/go/profiler"
	"github.com/reearth/reearth-backend/pkg/log"
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
		Service:        "reearth-backend",
		ServiceVersion: version,
	}); err != nil {
		log.Fatalln(err)
	}
}
