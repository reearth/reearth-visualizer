package app

import (
	"context"
	"os"
	"os/signal"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
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

	// Init repositories
	repos, gateways := initReposAndGateways(ctx, conf, debug)

	// Start web server
	NewServer(ctx, &ServerConfig{
		Config:   conf,
		Debug:    debug,
		Repos:    repos,
		Gateways: gateways,
	}).Run()
}

type WebServer struct {
	address   string
	appServer *echo.Echo
}

type ServerConfig struct {
	Config   *Config
	Debug    bool
	Repos    *repo.Container
	Gateways *gateway.Container
}

func NewServer(ctx context.Context, cfg *ServerConfig) *WebServer {
	port := cfg.Config.Port
	if port == "" {
		port = "8080"
	}

	address := "0.0.0.0:" + port
	if cfg.Debug {
		address = "localhost:" + port
	}

	w := &WebServer{
		address: address,
	}

	w.appServer = initEcho(ctx, cfg)
	return w
}

func (w *WebServer) Run() {
	defer log.Infoln("Server shutdown")

	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}
	log.Infof("server started%s at http://%s\n", debugLog, w.address)

	go func() {
		err := w.appServer.Start(w.address)
		log.Fatalln(err.Error())
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}
