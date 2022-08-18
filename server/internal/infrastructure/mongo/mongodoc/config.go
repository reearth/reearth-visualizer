package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/config"
	"github.com/reearth/reearth/server/pkg/workspace"
)

type ConfigDocument struct {
	Migration     int64
	Auth          *Auth
	DefaultPolicy *workspace.PolicyID
}

type Auth struct {
	Cert string
	Key  string
}

func NewConfig(c config.Config) ConfigDocument {
	d := ConfigDocument{
		Migration: c.Migration,
	}

	if c.Auth != nil {
		d.Auth = &Auth{
			Cert: c.Auth.Cert,
			Key:  c.Auth.Key,
		}
	}

	return d
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
