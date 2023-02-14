package app

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

const configPrefix = "reearth"

type Config struct {
	Port             string `default:"8080" envconfig:"PORT"`
	ServerHost       string
	Host             string `default:"http://localhost:8080"`
	Host_Web         string
	Dev              bool
	DB               string `default:"mongodb://localhost"`
	Mailer           string
	SMTP             SMTPConfig
	SendGrid         SendGridConfig
	GraphQL          GraphQLConfig
	Published        PublishedConfig
	GCPProject       string `envconfig:"GOOGLE_CLOUD_PROJECT"`
	Profiler         string
	Tracer           string
	TracerSample     float64
	GCS              GCSConfig
	Marketplace      MarketplaceConfig
	AssetBaseURL     string `default:"http://localhost:8080/assets"`
	Origins          []string
	Policy           PolicyConfig
	Web_Disabled     bool
	Web_App_Disabled bool
	Web              WebConfig
	SignupSecret     string
	SignupDisabled   bool
	// auth
	Auth          AuthConfigs
	Auth0         Auth0Config
	AuthSrv       AuthSrvConfig
	Auth_ISS      string
	Auth_AUD      string
	Auth_ALG      *string
	Auth_TTL      *int
	Auth_ClientID *string
}

type Auth0Config struct {
	Domain       string
	Audience     string
	ClientID     string
	ClientSecret string
	WebClientID  string
}

func (c Auth0Config) AuthConfigForWeb() *AuthConfig {
	if c.Domain == "" || c.WebClientID == "" {
		return nil
	}
	domain := prepareUrl(c.Domain)
	var aud []string
	if len(c.Audience) > 0 {
		aud = []string{c.Audience}
	}
	return &AuthConfig{
		ISS:      domain,
		AUD:      aud,
		ClientID: &c.WebClientID,
	}
}

func (c Auth0Config) AuthConfigForM2M() *AuthConfig {
	if c.Domain == "" || c.ClientID == "" {
		return nil
	}
	domain := prepareUrl(c.Domain)
	var aud []string
	if len(c.Audience) > 0 {
		aud = []string{c.Audience}
	}
	return &AuthConfig{
		ISS:      domain,
		AUD:      aud,
		ClientID: &c.ClientID,
	}
}

func (c Auth0Config) AuthConfigs() (res []AuthConfig) {
	if c := c.AuthConfigForWeb(); c != nil {
		res = append(res, *c)
	}
	if c := c.AuthConfigForM2M(); c != nil {
		res = append(res, *c)
	}
	return
}

type AuthSrvConfig struct {
	Dev      bool
	Disabled bool
	Issuer   string
	Domain   string
	UIDomain string
	Key      string
	DN       *AuthSrvDNConfig
}

func (c AuthSrvConfig) AuthConfig(debug bool, host string) *AuthConfig {
	if c.Disabled {
		return nil
	}

	domain := c.Domain
	if domain == "" {
		domain = host
	}

	var aud []string
	if debug && host != "" && c.Domain != "" && c.Domain != host {
		aud = []string{host, c.Domain}
	} else {
		aud = []string{domain}
	}

	return &AuthConfig{
		ISS:      domain,
		AUD:      aud,
		ClientID: lo.ToPtr(authServerDefaultClientID),
	}
}

type AuthSrvDNConfig struct {
	CN         string
	O          []string
	OU         []string
	C          []string
	L          []string
	ST         []string
	Street     []string
	PostalCode []string
}

func (a *AuthSrvDNConfig) AuthServerDNConfig() *authserver.DNConfig {
	if a == nil {
		return nil
	}
	return &authserver.DNConfig{
		CommonName:         a.CN,
		Organization:       a.O,
		OrganizationalUnit: a.OU,
		Country:            a.C,
		Province:           a.ST,
		StreetAddress:      a.Street,
		Locality:           a.L,
		PostalCode:         a.PostalCode,
	}
}

type GraphQLConfig struct {
	ComplexityLimit int `default:"6000"`
}

type PublishedConfig struct {
	IndexURL *url.URL
	Host     string
}

type GCSConfig struct {
	BucketName              string
	PublicationCacheControl string
}

type SendGridConfig struct {
	Email string
	Name  string
	API   string
}

type SMTPConfig struct {
	Host         string
	Port         string
	SMTPUsername string
	Email        string
	Password     string
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

func (c Config) Auths() (res []AuthConfig) {
	if ac := c.Auth0.AuthConfigs(); len(ac) > 0 {
		res = append(res, ac...)
	}
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
		})
	}
	if ac := c.AuthSrv.AuthConfig(c.Dev, c.Host); ac != nil {
		res = append(res, *ac)
	}
	return append(res, c.Auth...)
}

func (c Config) AuthForWeb() *AuthConfig {
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

func prepareUrl(url string) string {
	if !strings.HasPrefix(url, "https://") && !strings.HasPrefix(url, "http://") {
		url = "https://" + url
	}
	url = strings.TrimSuffix(url, "/")
	return url
}

type AuthConfig struct {
	ISS      string
	AUD      []string
	ALG      *string
	TTL      *int
	ClientID *string
}

type AuthConfigs []AuthConfig

// Decode is a custom decoder for AuthConfigs
func (ipd *AuthConfigs) Decode(value string) error {
	if value == "" {
		return nil
	}

	var providers []AuthConfig

	err := json.Unmarshal([]byte(value), &providers)
	if err != nil {
		return fmt.Errorf("invalid identity providers json: %w", err)
	}

	*ipd = providers
	return nil
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

func (c AuthSrvConfig) DomainURL() *url.URL {
	u, err := url.Parse(c.Domain)
	if err != nil {
		u = nil
	}
	return u
}

func (c AuthSrvConfig) UIDomainURL() *url.URL {
	u, err := url.Parse(c.UIDomain)
	if err != nil {
		u = nil
	}
	return u
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

type MarketplaceConfig struct {
	Endpoint string
	Secret   string
	OAuth    *OAuthClientCredentialsConfig
}

type OAuthClientCredentialsConfig struct {
	ClientID     string
	ClientSecret string
	TokenURL     string
	Scopes       []string
	Audience     []string
}

func (c *OAuthClientCredentialsConfig) Config() *clientcredentials.Config {
	if c == nil || c.ClientID == "" || c.ClientSecret == "" || c.TokenURL == "" {
		return nil
	}

	var params url.Values
	if len(c.Audience) > 0 {
		params = url.Values{
			"audience": c.Audience,
		}
	}

	return &clientcredentials.Config{
		ClientID:       c.ClientID,
		ClientSecret:   c.ClientSecret,
		TokenURL:       c.TokenURL,
		Scopes:         c.Scopes,
		AuthStyle:      oauth2.AuthStyleInParams,
		EndpointParams: params,
	}
}

type PolicyConfig struct {
	Default *workspace.PolicyID
}
