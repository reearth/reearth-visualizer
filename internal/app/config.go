package app

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearth-backend/pkg/log"
)

const configPrefix = "reearth"

type Config struct {
	Port         string `default:"8080" envconfig:"PORT"`
	Dev          bool
	DB           string `default:"mongodb://localhost"`
	Auth0        Auth0Config
	AuthSrv      AuthSrvConfig
	Auth         AuthConfigs
	Mailer       string
	SMTP         SMTPConfig
	SendGrid     SendGridConfig
	GraphQL      GraphQLConfig
	Published    PublishedConfig
	GCPProject   string `envconfig:"GOOGLE_CLOUD_PROJECT"`
	Profiler     string
	Tracer       string
	TracerSample float64
	GCS          GCSConfig
	AssetBaseURL string `default:"http://localhost:8080/assets"`
	Origins      []string
	Web          WebConfig
	SignupSecret string
}

type Auth0Config struct {
	Domain       string
	Audience     string
	ClientID     string
	ClientSecret string
	WebClientID  string
}

type AuthSrvConfig struct {
	Domain   string `default:"http://localhost:8080"`
	UIDomain string `default:"http://localhost:3000"`
	Key      string
	DN       *AuthDNConfig
}

type AuthDNConfig struct {
	CN         string
	O          []string
	OU         []string
	C          []string
	L          []string
	ST         []string
	Street     []string
	PostalCode []string
}

type GraphQLConfig struct {
	ComplexityLimit int `default:"6000"`
}

type PublishedConfig struct {
	IndexURL *url.URL
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

	if debug {
		c.Dev = true
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

type AuthConfig struct {
	ISS string
	AUD []string
	ALG *string
	TTL *int
}

type AuthConfigs []AuthConfig

// Decode is a custom decoder for AuthConfigs
func (ipd *AuthConfigs) Decode(value string) error {
	var providers []AuthConfig

	err := json.Unmarshal([]byte(value), &providers)
	if err != nil {
		return fmt.Errorf("invalid identity providers json: %w", err)
	}

	for i := range providers {
		if providers[i].TTL == nil {
			providers[i].TTL = new(int)
			*providers[i].TTL = 5
		}
		if providers[i].ALG == nil {
			providers[i].ALG = new(string)
			*providers[i].ALG = "RS256"
		}
	}

	*ipd = providers
	return nil
}
