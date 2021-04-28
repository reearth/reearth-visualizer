package memory

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/config"
)

type Config struct {
	data *config.Config
}

func NewConfig() repo.Config {
	return &Config{}
}

func (r *Config) Load(ctx context.Context) (*config.Config, error) {
	return r.data, nil
}

func (r *Config) Save(ctx context.Context, c *config.Config) error {
	r.data = c
	return nil
}
