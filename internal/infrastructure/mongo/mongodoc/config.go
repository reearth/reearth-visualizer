package mongodoc

import "github.com/reearth/reearth-backend/pkg/config"

type ConfigDocument struct {
	Migration int64
	Auth      *Auth
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
	m := &config.Config{
		Migration: c.Migration,
	}
	if c.Auth != nil {
		m.Auth = &config.Auth{
			Cert: c.Auth.Cert,
			Key:  c.Auth.Key,
		}
	}
	return m
}
