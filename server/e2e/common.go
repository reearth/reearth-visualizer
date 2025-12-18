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
	"github.com/reearth/reearth/server/internal/infrastructure/domain"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/infrastructure/policy"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"

	accountsGateway "github.com/reearth/reearth-accounts/server/pkg/gateway"
	accountsGQLclient "github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	adpaccounts "github.com/reearth/reearth/server/internal/adapter/accounts"
)

var (
	fr *gateway.File

	disabledAuthConfig = &config.Config{
		Origins: []string{"https://example.com"},
		Dev:     true,
		AccountsAPI: config.AccountsAPIConfig{
			Host:    "http://reearth-accounts-dev:8090",
			Timeout: 30,
		},
	}

	internalApiConfig = &config.Config{
		Origins: []string{"https://example.com"},
		AccountsAPI: config.AccountsAPIConfig{
			Host:    "http://reearth-accounts-dev:8090",
			Timeout: 30,
		},
		Visualizer: config.VisualizerConfig{
			InternalApi: config.InternalApiConfig{
				Active: true,
				Port:   "50051",
				Token:  "token",
			},
		},
	}
)

type Seeder func(ctx context.Context, r *repo.Container, f gateway.File, accountsClient *accountsGQLclient.Client, result *SeederResult) error

type accountsHostKey struct{}

func attachAccountsHost(ctx context.Context, host string) context.Context {
	if host == "" {
		return ctx
	}
	return context.WithValue(ctx, accountsHostKey{}, host)
}

func accountsHostFromContext(ctx context.Context) string {
	if host, ok := ctx.Value(accountsHostKey{}).(string); ok {
		return host
	}
	return ""
}

func init() {
	mongotest.Env = "REEARTH_DB"
}

func initRepos(t *testing.T, useMongo bool, seeder Seeder, cfg *config.Config) (repos *repo.Container, file gateway.File, ctx context.Context, accountsClient *accountsGQLclient.Client, seederResult *SeederResult) {
	ctx = context.Background()
	if cfg != nil {
		ctx = attachAccountsHost(ctx, cfg.AccountsAPI.Host)
	}

	if useMongo {
		db := mongotest.Connect(t)(t)
		fmt.Println("db.Name():", db.Name())

		// Create account container for mongo
		accountRepos := &accountsRepo.Container{
			User:        accountsInfra.NewMemoryUser(),
			Workspace:   accountsInfra.NewMemoryWorkspace(),
			Role:        accountsInfra.NewMemoryRole(),
			Permittable: accountsInfra.NewMemoryPermittable(),
		}

		repos = lo.Must(mongo.New(ctx, db, accountRepos, false))
	} else {
		repos = memory.New()
	}

	if fr == nil {
		file = lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com/"))
		fr = &file
	}

	// Initialize AccountsAPIClient for seeding
	if cfg != nil && cfg.AccountsAPI.Host != "" {
		accountsClient = accountsGQLclient.NewClient(
			cfg.AccountsAPI.Host,
			cfg.AccountsAPI.Timeout,
			adpaccounts.NewDynamicAuthTransport(),
		)
	}

	// Create seeder result with unique IDs
	seederResult = newSeederResult()

	if seeder != nil {
		if err := seeder(ctx, repos, *fr, accountsClient, seederResult); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return repos, *fr, ctx, accountsClient, seederResult
}

func initGateway() *gateway.Container {
	if fr == nil {
		return &gateway.Container{
			File:          lo.Must(fs.NewFile(afero.NewMemMapFs(), "https://example.com/")),
			PolicyChecker: policy.NewPermissiveChecker(),
			DomainChecker: domain.NewDefaultChecker(),
		}
	}
	return &gateway.Container{
		File:          *fr,
		PolicyChecker: policy.NewPermissiveChecker(),
		DomainChecker: domain.NewDefaultChecker(),
	}
}

func initAccountGateway(ctx context.Context) *accountsGateway.Container {
	return &accountsGateway.Container{
		Mailer: mailer.New(ctx, &mailer.Config{}),
	}
}

func initServerWithAccountGateway(cfg *config.Config, repos *repo.Container, ctx context.Context) (*app.WebServer, *gateway.Container, *accountsGateway.Container) {
	gateways := initGateway()
	accountGateway := initAccountGateway(ctx)

	// Initialize AccountsAPIClient for e2e tests
	accountsAPIClient := accountsGQLclient.NewClient(
		cfg.AccountsAPI.Host,
		cfg.AccountsAPI.Timeout,
		adpaccounts.NewDynamicAuthTransport(),
	)

	return app.NewServer(ctx, &app.ServerConfig{
		Config:            cfg,
		Repos:             repos,
		AccountRepos:      repos.AccountRepos(),
		Gateways:          gateways,
		AccountGateways:   accountGateway,
		AccountsAPIClient: accountsAPIClient,
		Debug:             true,
	}), gateways, accountGateway
}

func StartGQLServerWithRepos(t *testing.T, cfg *config.Config, repos *repo.Container) (*httpexpect.Expect, *gateway.Container, *accountsGateway.Container) {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	srv, gateways, accountGateway := initServerWithAccountGateway(cfg, repos, ctx)

	ch := make(chan error)

	var l net.Listener
	var err error

	if cfg.Visualizer.InternalApi.Active {
		l, err = net.Listen("tcp", ":"+cfg.Visualizer.InternalApi.Port)
		if err != nil {
			t.Fatalf("server failed to listen: %v", err)
		}
		go func() {
			if err := srv.ServeGRPC(l); err != http.ErrServerClosed {
				ch <- err
			}
			close(ch)
		}()
	} else {
		l, err = net.Listen("tcp", ":0")
		if err != nil {
			t.Fatalf("server failed to listen: %v", err)
		}
		go func() {
			if err := srv.Serve(l); err != http.ErrServerClosed {
				ch <- err
			}
			close(ch)
		}()
	}

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

func StartGQLServerAndRepos(t *testing.T, seeder Seeder) (*httpexpect.Expect, *accountsRepo.Container, *SeederResult) {
	repos, _, _, _, seederResult := initRepos(t, true, seeder, disabledAuthConfig)
	e, _, _ := StartGQLServerWithRepos(t, disabledAuthConfig, repos)
	return e, repos.AccountRepos(), seederResult
}

func startServer(t *testing.T, cfg *config.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container, *SeederResult) {
	repos, _, _, _, seederResult := initRepos(t, useMongo, seeder, cfg)
	e, gateways, _ := StartGQLServerWithRepos(t, cfg, repos)
	return e, repos, gateways, seederResult
}

func ServerAndRepos(t *testing.T, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container, *SeederResult) {
	return startServer(t, disabledAuthConfig, true, seeder)
}

func GRPCServer(t *testing.T, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container, *SeederResult) {
	return startServer(t, internalApiConfig, true, seeder)
}

func GRPCServeWithCtx(t *testing.T, seeder Seeder) (*httpexpect.Expect, *repo.Container, *gateway.Container, context.Context, *accountsGQLclient.Client, *SeederResult) {
	repos, _, ctx, accountsClient, seederResult := initRepos(t, true, seeder, internalApiConfig)
	e, gateways, _ := StartGQLServerWithRepos(t, internalApiConfig, repos)
	return e, repos, gateways, ctx, accountsClient, seederResult
}

func Server(t *testing.T, seeder Seeder) (*httpexpect.Expect, *SeederResult) {
	e, _, _, seederResult := startServer(t, disabledAuthConfig, true, seeder)
	return e, seederResult
}

func ServerPingTest(t *testing.T) (*httpexpect.Expect, *SeederResult) {
	e, _, _, seederResult := startServer(t, disabledAuthConfig, false, nil)
	return e, seederResult
}

func ServerMockTest(t *testing.T) (*httpexpect.Expect, *SeederResult) {
	c := &config.Config{
		Dev:     true,
		Origins: []string{"https://example.com"},
	}
	e, _, _, seederResult := startServer(t, c, true, nil)
	return e, seederResult
}

func ServerLanguage(t *testing.T, lang language.Tag) (*httpexpect.Expect, *SeederResult) {
	e, _, _, seederResult := startServer(t, disabledAuthConfig, true,
		func(ctx context.Context, r *repo.Container, f gateway.File, accountsClient *accountsGQLclient.Client, result *SeederResult) error {
			return baseSeederWithLang(ctx, r, f, lang, accountsClient, result)
		},
	)
	return e, seederResult
}

type GraphQLRequest struct {
	OperationName string         `json:"operationName"`
	Query         string         `json:"query"`
	Variables     map[string]any `json:"variables"`
}

func Request(e *httpexpect.Expect, user string, requestBody GraphQLRequest) *httpexpect.Value {
	response := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", user).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect()
	if response.Raw().StatusCode != http.StatusOK {
		RequestDump(requestBody)
	}

	return response.Status(http.StatusOK).JSON()
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

func ArrayDump(arrayVal *httpexpect.Array) {
	for _, val := range arrayVal.Iter() {
		ValueDump(&val)
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
