package app

import (
	"context"
	"net"
	"os"
	"os/signal"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"golang.org/x/net/http2"
	"google.golang.org/grpc"
)

func runServer(ctx context.Context, conf *config.Config, debug bool) {
	repos, gateways, accountsAPIClient, mockAccountUserRepo := initReposAndGateways(ctx, conf, debug)
	// Start web server
	NewServer(ctx, &ServerConfig{
		Config:   conf,
		Debug:    debug,
		Repos:    repos,
		Gateways: gateways,
		// AccountRepos:      acRepos,
		// AccountGateways:   acGateways,
		AccountsAPIClient: accountsAPIClient,
		MockAccountUserRepo: mockAccountUserRepo,
	}).Run(ctx)
}

type WebServer struct {
	address        string
	appServer      *echo.Echo
	internalPort   string
	internalServer *grpc.Server
}

type ServerConfig struct {
	Config            *config.Config
	Debug             bool
	Repos             *repo.Container
	Gateways          *gateway.Container
	AccountsAPIClient *gqlclient.Client
	MockAccountUserRepo interface{} // reearth-accounts memory repository for mock mode
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

	if cfg.Config.Visualizer.InternalApi.Active {
		w.internalPort = ":" + cfg.Config.Visualizer.InternalApi.Port
		w.internalServer = initGrpc(cfg)
	}
	return w
}

func (w *WebServer) Run(ctx context.Context) {
	defer log.Infof("server: shutdown")

	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}

	if w.internalServer != nil {
		go func() {
			lis, err := net.Listen("tcp", w.internalPort) // e.g. ":8080"
			if err != nil {
				log.Fatalf("failed to listen: %v", err)
			}
			log.Infof("server: started internal grpc server at %s", w.internalPort)
			if err := w.internalServer.Serve(lis); err != nil {
				log.Fatalf("failed to serve gRPC: %v", err)
			}
		}()
	} else {
		go func() {
			err := w.appServer.StartH2CServer(w.address, &http2.Server{}) // Echo fallback
			log.Fatalc(ctx, err.Error())
		}()
		log.Infof("server: echo api started%s at http://%s", debugLog, w.address)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}

func (w *WebServer) Serve(l net.Listener) error {
	return w.appServer.Server.Serve(l)
}

func (w *WebServer) ServeGRPC(l net.Listener) error {
	return w.internalServer.Serve(l)
}

func (w *WebServer) Shutdown(ctx context.Context) error {
	if w.internalServer != nil {
		w.internalServer.GracefulStop()
	}
	return w.appServer.Shutdown(ctx)
}
