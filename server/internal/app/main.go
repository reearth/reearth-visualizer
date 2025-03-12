package app

import (
	"context"
	"os"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
)

func Start(debug bool, version string) {
	log.Infof("reearth %s", version)

	ctx := context.Background()

	// Load config
	conf, cerr := config.ReadConfig(debug)
	if cerr != nil {
		log.Fatalf("failed to load config: %v", cerr)
	}
	log.Infof("config: %s", conf.Print())

	// Init profiler
	initProfiler(conf.Profiler, version)

	// Init tracer
	closer := initTracer(ctx, conf)
	defer func() {
		if closer != nil {
			if err := closer.Close(); err != nil {
				log.Errorf("Failed to close tracer: %s\n", err.Error())
			}
		}
	}()

	// run migration
	if os.Getenv("RUN_MIGRATION") == "true" {
		runMigration(ctx, conf)
		return
	}

	// run server
	runServer(ctx, conf, debug)
}
