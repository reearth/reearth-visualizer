package app

import (
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
)

const configPrefix = "reearth"

type Config struct {
	Port             string `default:"8080" envconfig:"PORT"`
	ServerHost       string
	Host             string `default:"http://localhost:8080"`
	Host_Web         string
	Dev              bool
	DB               string `default:"mongodb://localhost"`
	GraphQL          config.GraphQLConfig
	Published        config.PublishedConfig
	GCPProject       string `envconfig:"GOOGLE_CLOUD_PROJECT"`
	Profiler         string
	Tracer           string
	TracerSample     float64
	GCS              config.GCSConfig
	Marketplace      config.MarketplaceConfig
	AssetBaseURL     string `default:"http://localhost:8080/assets"`
	Origins          []string
	Policy           config.PolicyConfig
	Web_Disabled     bool
	Web_App_Disabled bool
	Web              map[string]string
	Web_Config       config.JSON
	Web_Title        string
	Web_FaviconURL   string
	SignupSecret     string
	SignupDisabled   bool
	HTTPSREDIRECT    bool

	// mailer
	Mailer   string
	SMTP     config.SMTPConfig
	SendGrid config.SendGridConfig
	SES      config.SESConfig

	// auth
	Auth          config.AuthConfigs
	Auth0         config.Auth0Config
	Cognito       config.CognitoConfig
	AuthSrv       config.AuthSrvConfig
	Auth_ISS      string
	Auth_AUD      string
	Auth_ALG      *string
	Auth_TTL      *int
	Auth_ClientID *string
	Auth_JWKSURI  *string
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

func (c Config) Print() string {
	s := fmt.Sprintf("%+v", c)
	for _, secret := range []string{c.DB, c.Auth0.ClientSecret} {
		if secret == "" {
			continue
		}
		s = strings.ReplaceAll(s, secret, "***")
	}
	return s
}

func (c Config) HostURL() *url.URL {
	u, err := url.Parse(c.Host)
	if err != nil {
		u = nil
	}
	return u
}

func (c Config) HostWebURL() *url.URL {
	u, err := url.Parse(c.Host_Web)
	if err != nil {
		u = nil
	}
	return u
}

func (c Config) Auths() (res []config.AuthConfig) {
	if ac := c.Auth0.AuthConfigs(); len(ac) > 0 {
		res = append(res, ac...)
	}
	if ac := c.Cognito.AuthConfig(); ac != nil {
		res = append(res, *ac)
	}
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		res = append(res, config.AuthConfig{
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

func (c Config) AuthForWeb() *config.AuthConfig {
	if ac := c.Auth0.AuthConfigForWeb(); ac != nil {
		return ac
	}
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		return &config.AuthConfig{
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

func (c Config) WebConfig() map[string]any {
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
