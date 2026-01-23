package config

import (
	"context"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/k0kubun/pp/v3"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mailer"
	"github.com/samber/lo"
)

const configPrefix = "reearth"

func init() {
	pp.Default.SetColoringEnabled(false)
}

type Mailer mailer.Mailer
type Config struct {
	mailer.Config
	Port                   string            `default:"8080" envconfig:"PORT"`
	ServerHost             string            `pp:",omitempty"`
	Host                   string            `default:"http://localhost:8080"`
	Host_Web               string            `pp:",omitempty"`
	Dev                    bool              `pp:",omitempty"`
	DB                     string            `default:"mongodb://localhost"`
	DB_Account             string            `default:"reearth-account" pp:",omitempty"`
	DB_Users               []appx.NamedURI   `pp:",omitempty"`
	DB_Vis                 string            `default:"reearth" pp:",omitempty"`
	GraphQL                GraphQLConfig     `pp:",omitempty"`
	Published              PublishedConfig   `pp:",omitempty"`
	GCPProject             string            `envconfig:"GOOGLE_CLOUD_PROJECT" pp:",omitempty"`
	OtelEnabled            bool              `envconfig:"REEARTH_OTEL_ENABLED" default:"false"`
	OtelEndpoint           string            `envconfig:"REEARTH_OTEL_ENDPOINT" default:"localhost:4317"`
	OtelExporterType       string            `envconfig:"REEARTH_OTEL_EXPORTER_TYPE" default:"otlp"` // otlp, jaeger, or gcp
	OtelBatchTimeout       time.Duration     `envconfig:"REEARTH_OTEL_BATCH_TIMEOUT" default:"1s"`   // seconds
	OtelMaxExportBatchSize int               `envconfig:"REEARTH_OTEL_MAX_EXPORT_BATCH_SIZE" default:"512"`
	OtelMaxQueueSize       int               `envconfig:"REEARTH_OTEL_MAX_QUEUE_SIZE" default:"2048"`
	OtelSamplingRatio      float64           `envconfig:"REEARTH_OTEL_SAMPLING_RATIO" default:"1.0"` // 0.0 to 1.0
	Profiler               string            `pp:",omitempty"`
	Tracer                 string            `pp:",omitempty"`
	TracerSample           float64           `default:"0.01" envconfig:"REEARTH_TRACER_SAMPLE" pp:",omitempty"`
	Marketplace            MarketplaceConfig `pp:",omitempty"`
	AssetBaseURL           string            `default:"http://localhost:8080/assets"`
	Origins                []string          `pp:",omitempty"`
	Web_Disabled           bool              `pp:",omitempty"`
	Web_App_Disabled       bool              `pp:",omitempty"`
	Web                    map[string]string `pp:",omitempty"`
	Web_Config             JSON              `pp:",omitempty"`
	Web_Title              string            `pp:",omitempty"`
	Web_FaviconURL         string            `pp:",omitempty"`
	SignupSecret           string            `pp:",omitempty"`
	SignupDisabled         bool              `pp:",omitempty"`
	HTTPSREDIRECT          bool              `pp:",omitempty"`

	// storage
	GCS GCSConfig `pp:",omitempty"`
	S3  S3Config  `pp:",omitempty"`

	// auth
	Auth          AuthConfigs   `pp:",omitempty"`
	Auth0         Auth0Config   `pp:",omitempty"`
	Cognito       CognitoConfig `pp:",omitempty"`
	Auth_ISS      string        `pp:",omitempty"`
	Auth_AUD      string        `pp:",omitempty"`
	Auth_ALG      *string       `pp:",omitempty"`
	Auth_TTL      *int          `pp:",omitempty"`
	Auth_ClientID *string       `pp:",omitempty"`
	Auth_JWKSURI  *string       `pp:",omitempty"`

	// system extensions
	Ext_Plugin []string `pp:",omitempty"`

	// Health Check Configuration
	HealthCheck HealthCheckConfig `pp:",omitempty"`

	Visualizer VisualizerConfig `pp:",omitempty"`

	// Accounts API Configuration
	AccountsAPI AccountsAPIConfig `pp:",omitempty"`
}

type AccountsAPIConfig struct {
	Host    string `default:"http://localhost:8081"`
	Timeout int    `default:"30"`
}

type HealthCheckConfig struct {
	Username string `pp:",omitempty"`
	Password string `pp:",omitempty"`
}

type VisualizerConfig struct {
	InternalApi InternalApiConfig `pp:",omitempty"`

	// Policy Checker Configuration
	Policy        Policy              `pp:",omitempty"`
	DomainChecker DomainCheckerConfig `pp:",omitempty"`
}

type Policy struct {
	Checker CheckerConfig
}

type CheckerConfig struct {
	Type     string `default:"permissive"`
	Endpoint string
	Token    string
	Timeout  int `default:"30"`
}

type DomainCheckerConfig struct {
	Type     string `default:"default"`
	Endpoint string
	Token    string
	Timeout  int `default:"30"`
}

type InternalApiConfig struct {
	Active bool   `default:"false" pp:",omitempty"`
	Port   string `default:"50051" pp:",omitempty"`
	Token  string `default:"" pp:",omitempty"`
}

func ReadConfig(debug bool) (*Config, error) {
	// load .env (skip if SKIP_DOTENV is set, e.g., when using docker-compose with env_file)
	if os.Getenv("SKIP_DOTENV") == "" {
		if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
			return nil, err
		} else if err == nil {
			log.Infof("config: .env loaded")
		}
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	// default values
	if debug {
		c.Dev = true
	}

	c.Host = addHTTPScheme(c.Host)
	if c.Host_Web == "" {
		c.Host_Web = c.Host
	} else {
		c.Host_Web = addHTTPScheme(c.Host_Web)
	}

	if c.Host_Web == "" {
		c.Host_Web = c.Host
	}

	// Fetch auth config from accounts API if not configured locally
	if c.Auth0.Domain == "" && c.AccountsAPI.Host != "" {
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		auth0Cfg, err := FetchAuthConfigFromAccounts(ctx, c.AccountsAPI.Host)
		if err != nil {
			log.Warnf("config: failed to fetch auth config from accounts API: %v", err)
		} else if auth0Cfg != nil {
			c.Auth0 = *auth0Cfg
			log.Infof("config: using auth config from accounts API")
		}
	}

	return &c, err
}

func (c *Config) Print() string {
	s := pp.Sprint(c)
	for _, secret := range c.secrets() {
		if secret == "" {
			continue
		}
		s = strings.ReplaceAll(s, secret, "***")
	}
	return s
}

func (c *Config) secrets() []string {
	s := []string{c.DB, c.Auth0.ClientSecret}
	for _, ac := range c.DB_Users {
		s = append(s, ac.URI)
	}
	return s
}

func (c *Config) HostURL() *url.URL {
	u, err := url.Parse(c.Host)
	if err != nil {
		u = nil
	}
	return u
}

func (c *Config) HostWebURL() *url.URL {
	u, err := url.Parse(c.Host_Web)
	if err != nil {
		u = nil
	}
	return u
}

func (c *Config) AuthConfigs() []AuthProvider {
	return []AuthProvider{c.Auth0, c.Cognito}
}

func (c *Config) Auths() (res AuthConfigs) {
	res = lo.FlatMap(c.AuthConfigs(), func(c AuthProvider, _ int) []AuthConfig { return c.Configs() })
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		res = append(res, AuthConfig{
			ISS:      c.Auth_ISS,
			AUD:      aud,
			ALG:      c.Auth_ALG,
			TTL:      c.Auth_TTL,
			ClientID: c.Auth_ClientID,
			JWKSURI:  c.Auth_JWKSURI,
		})
	}
	return append(res, c.Auth...)
}

func (c *Config) JWTProviders() (res []appx.JWTProvider) {
	return c.Auths().JWTProviders()
}

func (c *Config) AuthForWeb() *AuthConfig {
	if ac := c.Auth0.AuthConfigForWeb(); ac != nil {
		return ac
	}
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		return &AuthConfig{
			ISS:      c.Auth_ISS,
			AUD:      aud,
			ALG:      c.Auth_ALG,
			TTL:      c.Auth_TTL,
			ClientID: c.Auth_ClientID,
		}
	}
	return nil
}

func (c *Config) WebConfig() map[string]any {
	w := make(map[string]any)
	for k, v := range c.Web {
		w[k] = v
	}
	if m, ok := c.Web_Config.Data.(map[string]any); ok {
		for k, v := range m {
			w[k] = v
		}
	}
	return w
}

func addHTTPScheme(host string) string {
	if host == "" {
		return ""
	}
	if !strings.HasPrefix(host, "https://") && !strings.HasPrefix(host, "http://") {
		host = "http://" + host
	}
	return host
}

func strPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}
