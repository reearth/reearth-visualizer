package app

import (
	"context"
	"net"
	"net/http"
	"os"
	"os/signal"

	"github.com/cerbos/cerbos-sdk-go/cerbos"
	"github.com/go-redis/redis/v8"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	infraCerbos "github.com/reearth/reearth/server/internal/infrastructure/cerbos"
	infraRedis "github.com/reearth/reearth/server/internal/infrastructure/redis"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/uptrace/uptrace-go/uptrace"
	"golang.org/x/net/http2"
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

	// Init repositories
	repos, gateways, acRepos, acGateways := initReposAndGateways(ctx, conf, debug)

	// Redis
	redisClient := redis.NewClient(&redis.Options{
		Addr:     conf.RedisHost,
		Password: conf.RedisPassword,
		DB:       conf.RedisDB,
	})
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %+v\n", err)
	}
	redisAdapter := infraRedis.NewRedisAdapter(redisClient)

	// Init uptrace
	uptrace.ConfigureOpentelemetry(
		uptrace.WithDSN(conf.UptraceDSN),
		uptrace.WithServiceName("reearth"),
		uptrace.WithServiceVersion("1.0.0"),
	)
	defer func() {
		if err := uptrace.Shutdown(ctx); err != nil {
			log.Fatalf("failed to shutdown uptrace: %v", err)
		}
	}()

	// Cerbos
	cerbosClient, err := cerbos.New(conf.CerbosHost, cerbos.WithPlaintext())
	if err != nil {
		log.Fatalf("Failed to create cerbos client: %v", err)
	}
	cerbosAdapter := infraCerbos.NewCerbosAdapter(cerbosClient)

	// principal := cerbos.NewPrincipal("bugs_bunny", "user")
	// principal.WithAttr("beta_tester", true)

	// kind := "album:object"
	// actions := []string{"view:public", "comment"}

	// r1 := cerbos.NewResource(kind, "BUGS001")
	// r1.WithAttributes(map[string]any{
	// 	"owner":   "bugs_bunny",
	// 	"public":  false,
	// 	"flagged": false,
	// })

	// r2 := cerbos.NewResource(kind, "DAFFY002")
	// r2.WithAttributes(map[string]any{
	// 	"owner":   "daffy_duck",
	// 	"public":  true,
	// 	"flagged": false,
	// })

	// batch := cerbos.NewResourceBatch()
	// batch.Add(r1, actions...)
	// batch.Add(r2, actions...)

	// resp, err := cerbosClient.CheckResources(context.Background(), principal, batch)
	// if err != nil {
	// 	log.Fatalf("Failed to check resources: %v", err)
	// }
	// log.Printf("%v", resp)

	// Start web server
	NewServer(ctx, &ServerConfig{
		Config:          conf,
		Debug:           debug,
		Repos:           repos,
		AccountRepos:    acRepos,
		Gateways:        gateways,
		AccountGateways: acGateways,
		RedisAdapter:    redisAdapter,
		CerbosAdapter:   cerbosAdapter,
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
	RedisAdapter    *infraRedis.RedisAdapter
	CerbosAdapter   *infraCerbos.CerbosAdapter
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
	defer log.Infof("Server shutdown")

	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}
	log.Infof("server started%s at http://%s\n", debugLog, w.address)

	go func() {
		err := w.appServer.StartH2CServer(w.address, &http2.Server{})
		log.Fatalf("failed to run server: %v", err)
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
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
