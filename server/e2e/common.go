package e2e

import (
	"context"
	"net"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
)

type Seeder func(ctx context.Context, r *repo.Container) error

func init() {
	mongotest.Env = "REEARTH_DB"
}

func StartServer(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) *httpexpect.Expect {
	e, _ := StartServerAndRepos(t, cfg, useMongo, seeder)
	return e
}

func StartServerAndRepos(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container) {
	ctx := context.Background()

	var repos *repo.Container
	if useMongo {
		db := mongotest.Connect(t)(t)
		repos = lo.Must(mongo.New(ctx, db, false))
	} else {
		repos = memory.New()
	}

	if seeder != nil {
		if err := seeder(ctx, repos); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return StartServerWithRepos(t, cfg, repos), repos
}
func StartServerWithRepos(t *testing.T, cfg *app.Config, repos *repo.Container) *httpexpect.Expect {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}

	srv := app.NewServer(ctx, &app.ServerConfig{
		Config: cfg,
		Repos:  repos,
		Gateways: &gateway.Container{
			File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com")),
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

type GraphQLRequest struct {
	OperationName string         `json:"operationName"`
	Query         string         `json:"query"`
	Variables     map[string]any `json:"variables"`
}
