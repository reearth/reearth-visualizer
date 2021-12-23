package mongodoc

import "github.com/reearth/reearth-backend/pkg/config"

type ConfigDocument struct {
	Migration int64
}

func NewConfig(c config.Config) ConfigDocument {
	return ConfigDocument{
		Migration: c.Migration,
	}
}

func (c *ConfigDocument) Model() *config.Config {
	if c == nil {
		return &config.Config{}
	}
	return &config.Config{
		Migration: c.Migration,
	}
}
