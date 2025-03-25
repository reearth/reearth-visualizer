package e2e

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"reflect"
	"regexp"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

var (
	fr                 *gateway.File
	disabledAuthConfig = &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}
)

type Seeder func(ctx context.Context, r *repo.Container, f gateway.File) error

func init() {
	mongotest.Env = "REEARTH_DB"
}

func initRepos(t *testing.T, useMongo bool, seeder Seeder) (repos *repo.Container, file gateway.File) {
	ctx := context.Background()

	if useMongo {
		db := mongotest.Connect(t)(t)
		fmt.Println("db.Name():", db.Name())
		accountRepos := lo.Must(accountmongo.New(ctx, db.Client(), db.Name(), false, false, nil))
		repos = lo.Must(mongo.New(ctx, db, accountRepos, false))
	} else {
		repos = memory.New()
	}

	file = lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com/"))
	fr = &file
	if seeder != nil {
		if err := seeder(ctx, repos, file); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return repos, file
}

func initGateway() *gateway.Container {
	if fr == nil {
		return &gateway.Container{
			File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com/")),
		}
	}
	return &gateway.Container{
		File: *fr,
	}
}

func initAccountGateway(ctx context.Context) *accountgateway.Container {
	return &accountgateway.Container{
		Mailer: mailer.New(ctx, &mailer.Config{}),
	}
}

func initServerWithAccountGateway(cfg *config.Config, repos *repo.Container, ctx context.Context) (*app.WebServer, *gateway.Container, *accountgateway.Container) {
	gateways := initGateway()
	accountGateway := initAccountGateway(ctx)
	return app.NewServer(ctx, &app.ServerConfig{
		Config:          cfg,
		Repos:           repos,
		AccountRepos:    repos.AccountRepos(),
		Gateways:        gateways,
		AccountGateways: accountGateway,
		Debug:           true,
	}), gateways, accountGateway
}

func StartGQLServerWithRepos(t *testing.T, cfg *config.Config, repos *repo.Container) (*httpexpect.Expect, *gateway.Container, *accountgateway.Container) {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()
	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}

	srv, gateways, accountGateway := initServerWithAccountGateway(cfg, repos, ctx)

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
	return httpexpect.Default(t, "http://"+l.Addr().String()), gateways, accountGateway
}

func StartGQLServerAndRepos(t *testing.T, seeder Seeder) (*httpexpect.Expect, *accountrepo.Container) {
	repos, _ := initRepos(t, true, seeder)
	e, _, _ := StartGQLServerWithRepos(t, disabledAuthConfig, repos)
	return e, repos.AccountRepos()
}

func startServer(t *testing.T, cfg *config.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container) {
	repos, _ := initRepos(t, useMongo, seeder)
	e, gateways, _ := StartGQLServerWithRepos(t, cfg, repos)
	return e, repos, gateways
}

func ServerAndRepos(t *testing.T, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container) {
	return startServer(t, disabledAuthConfig, true, seeder)
}

func Server(t *testing.T, seeder Seeder) *httpexpect.Expect {
	e, _, _ := startServer(t, disabledAuthConfig, true, seeder)
	return e
}

func ServerPingTest(t *testing.T) *httpexpect.Expect {
	e, _, _ := startServer(t, disabledAuthConfig, false, nil)
	return e
}

func ServerMockTest(t *testing.T) *httpexpect.Expect {
	c := &config.Config{
		Dev:      true,
		MockAuth: true,
		Origins:  []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}
	e, _, _ := startServer(t, c, true, nil)
	return e
}

func ServerLanguage(t *testing.T, lang language.Tag) *httpexpect.Expect {
	e, _, _ := startServer(t, disabledAuthConfig, true,
		func(ctx context.Context, r *repo.Container, f gateway.File) error {
			return baseSeederWithLang(ctx, r, f, lang)
		},
	)
	return e
}

type GraphQLRequest struct {
	OperationName string         `json:"operationName"`
	Query         string         `json:"query"`
	Variables     map[string]any `json:"variables"`
}

func Request(e *httpexpect.Expect, user string, requestBody GraphQLRequest) *httpexpect.Value {
	// RequestDump(requestBody)
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", user).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
}

func RequestQuery(t *testing.T, e *httpexpect.Expect, query string, user string) *httpexpect.Value {
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	assert.Nil(t, err)
	return e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", user).
		WithBytes(jsonData).
		Expect().
		Status(http.StatusOK).
		JSON()
}

func RequestWithMultipart(e *httpexpect.Expect, user string, requestBody map[string]interface{}, filePath string) *httpexpect.Value {
	jsonData, _ := json.Marshal(requestBody)
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", user).
		WithMultipart().
		WithFormField("operations", string(jsonData)).
		WithFormField("map", `{"0": ["variables.file"]}`).
		WithFile("0", filePath).
		Expect().
		Status(http.StatusOK).
		JSON()
}

func JSONEqRegexp(t *testing.T, actual string, expected string) bool {
	return assert.Regexp(
		t,
		regexp.MustCompile(strings.ReplaceAll(aligningJSON(t, expected), "[", "\\[")),
		aligningJSON(t, actual),
	)
}

func RegexpJSONEReadCloser(t *testing.T, actual io.ReadCloser, expected string) bool {
	defer func() {
		if err := actual.Close(); err != nil {
			t.Errorf("failed to close reader: %v", err)
		}
	}()
	actualBuf := new(bytes.Buffer)
	_, err := actualBuf.ReadFrom(actual)
	assert.NoError(t, err)
	// ActualDump(actualBuf)
	return JSONEqRegexp(t, actualBuf.String(), expected)
}

func JSONEqRegexpInterface(t *testing.T, actual interface{}, expected string) bool {
	actualBytes, err := json.Marshal(actual)
	assert.Nil(t, err)
	return JSONEqRegexp(t, string(actualBytes), expected)
}

func JSONEqRegexpValue(t *testing.T, actual *httpexpect.Value, expected string) bool {
	if actualData, ok := actual.Raw().(map[string]interface{}); ok {
		return JSONEqRegexpInterface(t, actualData, expected)
	}
	return false
}

func aligningJSON(t *testing.T, str string) string {
	// Unmarshal and Marshal to make the JSON format consistent
	var obj interface{}
	err := json.Unmarshal([]byte(str), &obj)
	assert.Nil(t, err)
	strBytes, err := json.Marshal(obj)
	assert.Nil(t, err)
	return string(strBytes)
}

func RequestDump(requestBody GraphQLRequest) {
	if jsonData, err := json.MarshalIndent(requestBody, "", "  "); err == nil {
		fmt.Println(string(jsonData))
	}
}

func ValueDump(val *httpexpect.Value) {
	raw := val.Raw()
	switch data := raw.(type) {
	case map[string]interface{}:
		if text, err := json.MarshalIndent(data, "", "  "); err == nil {
			fmt.Println(string(text))
		}
	case []interface{}:
		if text, err := json.MarshalIndent(data, "", "  "); err == nil {
			fmt.Println(string(text))
		}
	default:
		fmt.Println("Unsupported type:", reflect.TypeOf(raw))
	}
}

func ActualDump(actual *bytes.Buffer) {
	var data interface{}
	if err := json.Unmarshal(actual.Bytes(), &data); err != nil {
		fmt.Println("Invalid JSON:", err)
		return
	}
	if text, err := json.MarshalIndent(data, "", "  "); err == nil {
		fmt.Println(string(text))
	} else {
		fmt.Println("Failed to format JSON:", err)
	}
}
