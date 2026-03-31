package e2e

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	gqlclient "github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	"github.com/reearth/reearth/server/internal/app"
	"github.com/reearth/reearth/server/internal/app/otel"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/require"
)

// importCapableGateway wraps the fs file gateway and adds real import zip
// support using the same in-memory filesystem.
// The default fs gateway stubs out import methods; this enables end-to-end testing.
type importCapableGateway struct {
	gateway.File
	memFs afero.Fs
}

func newImportCapableGateway() (*importCapableGateway, error) {
	memFs := afero.NewMemMapFs()
	base, err := fs.NewFile(memFs, "https://example.com/")
	if err != nil {
		return nil, err
	}
	return &importCapableGateway{File: base, memFs: memFs}, nil
}

func (g *importCapableGateway) UploadImportProjectZip(_ context.Context, name string, r io.Reader) error {
	if err := g.memFs.MkdirAll("import", 0755); err != nil {
		return err
	}
	f, err := g.memFs.Create("import/" + name)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, r)
	return err
}

func (g *importCapableGateway) ReadImportProjectZip(_ context.Context, name string) (io.ReadCloser, error) {
	return g.memFs.Open("import/" + name)
}

func (g *importCapableGateway) RemoveImportProjectZip(_ context.Context, name string) error {
	err := g.memFs.Remove("import/" + name)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func (g *importCapableGateway) GenerateSignedUploadUrl(_ context.Context, fileName string) (*string, int, *string, error) {
	url := "http://fake-upload/" + fileName
	ct := "application/zip"
	return &url, 60, &ct, nil
}

// unauthorizedTransport is an http.RoundTripper that always returns 401.
// It simulates what the real accounts API returns when called without a JWT,
// so if generateOperator calls AccountsAPIClient the test will fail with 401.
type unauthorizedTransport struct{}

func (unauthorizedTransport) RoundTrip(_ *http.Request) (*http.Response, error) {
	return &http.Response{
		StatusCode: http.StatusUnauthorized,
		Body:       http.NoBody,
		Header:     make(http.Header),
	}, nil
}

func newFakeAccountsClient() *gqlclient.Client {
	return gqlclient.NewClient("http://fake-accounts-api", 5, unauthorizedTransport{})
}

func serverWithAccountsClient(t *testing.T, seeder Seeder, fileGw gateway.File, accountsClient *gqlclient.Client) (*httpexpect.Expect, *repo.Container, *gateway.Container) {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()
	db := mongotest.Connect(t)(t)
	accountRepos := lo.Must(accountsInfra.New(ctx, db.Client(), db.Name(), false, false, nil))
	repos := lo.Must(mongo.New(ctx, db, accountRepos, false))

	if seeder != nil {
		if err := seeder(ctx, repos, fileGw); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	gateways := initGatewayWithFile(fileGw)
	accountGateway := initAccountGateway(ctx)
	srv := app.NewServer(ctx, &app.ServerConfig{
		Config:            disabledAuthConfig,
		Repos:             repos,
		AccountRepos:      repos.AccountRepos(),
		Gateways:          gateways,
		AccountGateways:   accountGateway,
		AccountsAPIClient: accountsClient,
		Debug:             true,
		ServiceName:       otel.OtelVisualizerServiceName,
	})

	ch := make(chan error)
	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}
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

	return httpexpect.Default(t, "http://"+l.Addr().String()), repos, gateways
}

// TestStorageEventImportFlow is an end-to-end integration test for the storage-event import flow:
//  1. Export an existing project to produce a valid zip
//  2. Create a destination project
//  3. Write the zip directly into the import gateway
//  4. POST /api/storage-event with no JWT (simulating a Pub/Sub push)
//  5. Assert the response is {"status":"success"}
//
// The server is configured with an AccountsAPIClient that always returns 401.
// If generateOperator calls the accounts API (i.e. the fix is removed), the
// storage-event endpoint will return 401 and the test will fail.
func TestStorageEventImportFlow(t *testing.T) {
	gw, err := newImportCapableGateway()
	require.NoError(t, err)

	e, _, _ := serverWithAccountsClient(t, fullSeeder, gw, newFakeAccountsClient())

	// 1. Export an existing project to get a valid zip.
	zipPath := GenProjectZipFile(t, e)
	zipBytes, err := os.ReadFile(zipPath)
	require.NoError(t, err)

	// 2. Create a destination project.
	destProjectId := createProject(e, uID, map[string]any{
		"name":        "import-destination",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})

	// 3. Write the zip to import/{wid}-{pid}-{uid}.zip in the gateway.
	filename := fmt.Sprintf("%s-%s-%s.zip", wID.String(), destProjectId, uID.String())
	require.NoError(t, gw.memFs.MkdirAll("import", 0755))
	f, err := gw.memFs.Create("import/" + filename)
	require.NoError(t, err)
	_, err = io.Copy(f, bytes.NewReader(zipBytes))
	require.NoError(t, err)
	f.Close()

	// 4. POST /api/storage-event — no Authorization header, simulating a Pub/Sub push.
	payload := fmt.Sprintf(`{"bucket":"test-bucket","name":"import/%s"}`, filename)
	encoded := base64.StdEncoding.EncodeToString([]byte(payload))
	body := fmt.Sprintf(`{"message":{"data":"%s","messageId":"test-1","publishTime":"%s"},"subscription":"local"}`,
		encoded, time.Now().UTC().Format(time.RFC3339))

	resp := e.POST("/api/storage-event").
		WithHeader("Content-Type", "application/json").
		WithBytes([]byte(body)).
		Expect()

	require.NotEqual(t, http.StatusUnauthorized, resp.Raw().StatusCode,
		"storage-event returned 401 — generateOperator called accounts API without a JWT")

	// 5. storage-event is synchronous — assert the import completed successfully.
	resp.Status(http.StatusOK).JSON().Object().HasValue("status", "success")
}
