package app

import (
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/log"
	echotracer "go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo"
)

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

func NewServer(cfg *ServerConfig) *WebServer {
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

	w.appServer = initAppEcho(cfg)
	return w
}

func (w *WebServer) Run() {
	defer log.Infoln("Server shutdown")

	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}
	log.Infof("Server started%s\n", debugLog)

	go func() {
		err := w.appServer.Start(w.address)
		log.Fatalln(err.Error())
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}

func newEcho(cfg *ServerConfig) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalln("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true

	logger := GetEchoLogger()
	e.Logger = logger
	e.Use(logger.Hook())

	e.Use(middleware.Recover(), echotracer.Middleware("reearth-backend"))

	if e.Debug {
		// enable pprof
		e.GET("/debug/pprof/*", echo.WrapHandler(http.DefaultServeMux))
	}

	return e
}
