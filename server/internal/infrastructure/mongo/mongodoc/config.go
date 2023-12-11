package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/config"
	"github.com/reearth/reearth/server/pkg/policy"
)

type ConfigDocument struct {
	Migration     int64
	Auth          *Auth
	DefaultPolicy *policy.ID
}

type Auth struct {
	Cert string
	Key  string
}

func NewConfig(c config.Config) ConfigDocument {
	return ConfigDocument{
		Migration: c.Migration,
		Auth:      NewConfigAuth(c.Auth),
	}
}

func NewConfigAuth(c *config.Auth) *Auth {
	if c == nil {
		return nil
	}
	return &Auth{
		Cert: c.Cert,
		Key:  c.Key,
	}
}

func (c *ConfigDocument) Model() *config.Config {
	if c == nil {
		return &config.Config{}
	}

	cfg := &config.Config{
		Migration: c.Migration,
	}

	if c.Auth != nil {
		cfg.Auth = &config.Auth{
			Cert: c.Auth.Cert,
			Key:  c.Auth.Key,
		}
	}

	return cfg
}
