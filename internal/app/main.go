package app

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/log"
)

func Start(debug bool, version string) {
	log.Infof("reearth-backend %s", version)

	ctx := context.Background()

	// Load config
	conf, cerr := ReadConfig(debug)
	if cerr != nil {
		log.Fatal(cerr)
	}

	// Init profiler
	initProfiler(conf.Profiler, version)

	// Init tracer
	closer := initTracer(conf)
	defer func() {
		if closer != nil {
			if err := closer.Close(); err != nil {
				log.Errorf("Failed to close tracer: %s\n", err.Error())
			}
		}
	}()

	// Init repositories
	repos, gateways := initReposAndGateways(ctx, conf, debug)

	server := NewServer(&ServerConfig{
		Config:   conf,
		Debug:    debug,
		Repos:    repos,
		Gateways: gateways,
	})
	server.Run()
}
