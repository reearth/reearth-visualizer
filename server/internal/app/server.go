package app

import (
	"context"
	"errors"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"golang.org/x/net/http2"
)

func runServer(ctx context.Context, conf *config.Config, debug bool) {
	repos, gateways, acRepos, acGateways := initReposAndGateways(ctx, conf, debug)
	// Start web server
	NewServer(ctx, &ServerConfig{
		Config:          conf,
		Debug:           debug,
		Repos:           repos,
		AccountRepos:    acRepos,
		Gateways:        gateways,
		AccountGateways: acGateways,
	}).Run()
}

type WebServer struct {
	address   string
	appServer *echo.Echo
}

type ServerConfig struct {
	Config          *config.Config
	Debug           bool
	Repos           *repo.Container
	AccountRepos    *accountrepo.Container
	Gateways        *gateway.Container
	AccountGateways *accountgateway.Container
}

func NewServer(ctx context.Context, cfg *ServerConfig) *WebServer {
	port := cfg.Config.Port
	if port == "" {
		port = "8080"
	}

	host := cfg.Config.ServerHost
	if host == "" {
		if cfg.Debug {
			host = "localhost"
		} else {
			host = "0.0.0.0"
		}
	}
	address := host + ":" + port

	w := &WebServer{
		address: address,
	}

	w.appServer = initEcho(ctx, cfg)
	return w
}

func (w *WebServer) Run() {
	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}
	log.Infof("server started%s at http://%s\n", debugLog, w.address)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		if err := w.appServer.StartH2CServer(w.address, &http2.Server{}); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("failed to run server: %v", err)
		}
	}()

	<-c
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := w.appServer.Shutdown(ctx); err != nil {
		log.Panicf("Server forced to shutdown: %v", err)
	}

	log.Info("Server shut down gracefully...")
}

func (w *WebServer) Serve(l net.Listener) error {
	return w.appServer.Server.Serve(l)
}

func (w *WebServer) ServeHTTP(wr http.ResponseWriter, r *http.Request) {
	w.appServer.ServeHTTP(wr, r)
}

func (w *WebServer) Shutdown(ctx context.Context) error {
	return w.appServer.Shutdown(ctx)
}
