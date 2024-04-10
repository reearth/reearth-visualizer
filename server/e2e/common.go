package e2e

import (
	"context"
	"net"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/go-redis/redis/v8"
	"github.com/reearth/reearth/server/internal/app"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	infraRedis "github.com/reearth/reearth/server/internal/infrastructure/redis"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
)

type Seeder func(ctx context.Context, r *repo.Container) error

func init() {
	mongotest.Env = "REEARTH_DB"
}

func StartServer(t *testing.T, cfg *config.Config, useMongo bool, seeder Seeder) *httpexpect.Expect {
	e, _, _ := StartServerAndRepos(t, cfg, useMongo, seeder)
	return e
}

func initRepos(t *testing.T, useMongo bool, seeder Seeder) (repos *repo.Container) {
	ctx := context.Background()

	if useMongo {
		db := mongotest.Connect(t)(t)
		accountRepos := lo.Must(accountmongo.New(ctx, db.Client(), db.Name(), false, false, nil))
		repos = lo.Must(mongo.New(ctx, db, accountRepos, false))
	} else {
		repos = memory.New()
	}

	if seeder != nil {
		if err := seeder(ctx, repos); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return repos
}

func initGateway() *gateway.Container {
	return &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
	}
}

func StartServerAndRepos(t *testing.T, cfg *config.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container) {
	repos := initRepos(t, useMongo, seeder)
	gateways := initGateway()
	return StartServerWithRepos(t, cfg, repos, gateways), repos, gateways
}

func StartServerWithRepos(t *testing.T, cfg *config.Config, repos *repo.Container, gateways *gateway.Container) *httpexpect.Expect {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}

	var redisAdapter *infraRedis.RedisAdapter
	if cfg.RedisHost != "" {
		redisClient := redis.NewClient(&redis.Options{
			Addr:     cfg.RedisHost,
			Password: "",
			DB:       0,
		})
		_, err = redisClient.Ping(ctx).Result()
		if err != nil {
			t.Fatalf("Failed to connect to Redis: %+v\n", err)
		}
		redisAdapter = infraRedis.NewRedisAdapter(redisClient)
	}

	srv := app.NewServer(ctx, &app.ServerConfig{
		Config:       cfg,
		Repos:        repos,
		Gateways:     gateways,
		Debug:        true,
		AccountRepos: repos.AccountRepos(),
		RedisAdapter: redisAdapter,
	})

	ch := make(chan error)
	go func() {
		if err := srv.Serve(l); err != http.ErrServerClosed {
			ch <- err
		}
		close(ch)
	}()

	t.Cleanup(func() {
		if err := srv.Shutdown(context.Background()); err != nil {
			t.Fatalf("server shutdown: %v", err)
		}

		if err := <-ch; err != nil {
			t.Fatalf("server serve: %v", err)
		}
	})

	return httpexpect.New(t, "http://"+l.Addr().String())
}

type GraphQLRequest struct {
	OperationName string         `json:"operationName"`
	Query         string         `json:"query"`
	Variables     map[string]any `json:"variables"`
}

func StartGQLServer(t *testing.T, cfg *config.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *accountrepo.Container) {
	e, r := StartGQLServerAndRepos(t, cfg, useMongo, seeder)
	return e, r
}

func StartGQLServerAndRepos(t *testing.T, cfg *config.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *accountrepo.Container) {
	repos := initRepos(t, useMongo, seeder)
	acRepos := repos.AccountRepos()
	return StartGQLServerWithRepos(t, cfg, repos, acRepos), acRepos
}

func StartGQLServerWithRepos(t *testing.T, cfg *config.Config, repos *repo.Container, accountrepos *accountrepo.Container) *httpexpect.Expect {
	t.Helper()

	if testing.Short() {
		t.SkipNow()
	}

	ctx := context.Background()
	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}

	srv := app.NewServer(ctx, &app.ServerConfig{
		Config:       cfg,
		Repos:        repos,
		AccountRepos: accountrepos,
		Gateways: &gateway.Container{
			File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
		},
		AccountGateways: &accountgateway.Container{
			Mailer: mailer.New(ctx, &mailer.Config{}),
		},
		Debug: true,
	})

	ch := make(chan error)
	go func() {
		if err := srv.Serve(l); err != http.ErrServerClosed {
			ch <- err
		}
		close(ch)
	}()
	t.Cleanup(func() {
		if err := srv.Shutdown(context.Background()); err != nil {
			t.Fatalf("server shutdown: %v", err)
		}

		if err := <-ch; err != nil {
			t.Fatalf("server serve: %v", err)
		}
	})
	return httpexpect.New(t, "http://"+l.Addr().String())
}
