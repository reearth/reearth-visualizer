package app

import (
	"os"

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
	GraphQL      GraphQLConfig
	GCPProject   string `envconfig:"GOOGLE_CLOUD_PROJECT"`
	Profiler     string
	Tracer       string
	TracerSample float64
	GCS          GCSConfig
	AssetBaseURL string
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

type GraphQLConfig struct {
	ComplexityLimit int `default:"4000"`
}

type GCSConfig struct {
	BucketName              string
	PublicationCacheControl string
}

func ReadConfig(debug bool) (*Config, error) {
	if debug {
		// .env.local file is only available in debug environment
		if err := godotenv.Load(".env.local"); err != nil && !os.IsNotExist(err) {
			return nil, err
		}
		log.Infof("config: .env.local loaded")
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	return &c, err
}
