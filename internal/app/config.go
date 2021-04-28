package app

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
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
	ServeFiles   bool
	AssetBaseURL string
	Origins      []string
	Web          WebConfig
	SignupSecret string
}

type Auth0Config struct {
	Domain       string
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
	envs := []string{}
	if debug {
		// .env file is only available in debug environment
		envs = append(envs, ".env", ".env.local")
	}
	for _, e := range envs {
		if err := godotenv.Load(e); err != nil && !os.IsNotExist(err) {
			return nil, err
		}
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	return &c, err
}
