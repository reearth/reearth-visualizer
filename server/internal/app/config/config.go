package config

import (
	"net/url"
	"os"
	"strings"

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
	Port             string            `default:"8080" envconfig:"PORT"`
	ServerHost       string            `pp:",omitempty"`
	Host             string            `default:"http://localhost:8080"`
	Host_Web         string            `pp:",omitempty"`
	Dev              bool              `pp:",omitempty"`
	DB               string            `default:"mongodb://localhost"`
	DB_Account       string            `pp:",omitempty"`
	DB_Users         []appx.NamedURI   `pp:",omitempty"`
	GraphQL          GraphQLConfig     `pp:",omitempty"`
	Published        PublishedConfig   `pp:",omitempty"`
	GCPProject       string            `envconfig:"GOOGLE_CLOUD_PROJECT" pp:",omitempty"`
	Profiler         string            `pp:",omitempty"`
	Tracer           string            `pp:",omitempty"`
	TracerSample     float64           `pp:",omitempty"`
	Marketplace      MarketplaceConfig `pp:",omitempty"`
	AssetBaseURL     string            `default:"http://localhost:8080/assets"`
	Origins          []string          `pp:",omitempty"`
	Policy           PolicyConfig      `pp:",omitempty"`
	Web_Disabled     bool              `pp:",omitempty"`
	Web_App_Disabled bool              `pp:",omitempty"`
	Web              map[string]string `pp:",omitempty"`
	Web_Config       JSON              `pp:",omitempty"`
	Web_Title        string            `pp:",omitempty"`
	Web_FaviconURL   string            `pp:",omitempty"`
	SignupSecret     string            `pp:",omitempty"`
	SignupDisabled   bool              `pp:",omitempty"`
	HTTPSREDIRECT    bool              `pp:",omitempty"`

	// storage
	GCS GCSConfig `pp:",omitempty"`
	S3  S3Config  `pp:",omitempty"`

	// auth
	Auth          AuthConfigs   `pp:",omitempty"`
	Auth0         Auth0Config   `pp:",omitempty"`
	Cognito       CognitoConfig `pp:",omitempty"`
	AuthSrv       AuthSrvConfig `pp:",omitempty"`
	Auth_ISS      string        `pp:",omitempty"`
	Auth_AUD      string        `pp:",omitempty"`
	Auth_ALG      *string       `pp:",omitempty"`
	Auth_TTL      *int          `pp:",omitempty"`
	Auth_ClientID *string       `pp:",omitempty"`
	Auth_JWKSURI  *string       `pp:",omitempty"`

	// system extensions
	Ext_Plugin []string `pp:",omitempty"`

	// redis
	RedisHost     string `envconfig:"REDIS_HOST" default:"localhost:6379"`
	RedisPassword string `envconfig:"REDIS_PASSWORD" default:""`
	RedisDB       int    `envconfig:"REDIS_DB" default:"0"`

	// uptrace
	UptraceDSN string `envconfig:"UPTRACE_DSN" pp:",omitempty"`

	// cerbos
	CerbosHost string `envconfig:"CERBOS_HOST" default:"localhost:3593"`
}

func ReadConfig(debug bool) (*Config, error) {
	// load .env
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		return nil, err
	} else if err == nil {
		log.Infof("config: .env loaded")
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

	if c.AuthSrv.Domain == "" {
		c.AuthSrv.Domain = c.Host
	} else {
		c.AuthSrv.Domain = addHTTPScheme(c.AuthSrv.Domain)
	}

	if c.Host_Web == "" {
		c.Host_Web = c.Host
	}

	if c.AuthSrv.UIDomain == "" {
		c.AuthSrv.UIDomain = c.Host_Web
	} else {
		c.AuthSrv.UIDomain = addHTTPScheme(c.AuthSrv.UIDomain)
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
	if ac := c.AuthSrv.AuthConfig(c.Dev, c.Host); ac != nil {
		res = append(res, *ac)
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
	if ac := c.AuthSrv.AuthConfig(c.Dev, c.Host); ac != nil {
		return ac
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
