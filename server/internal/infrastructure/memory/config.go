package memory

import (
	"context"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/config"
)

type Config struct {
	lock   sync.Mutex
	locked bool
	data   *config.Config
}

func NewConfig() repo.Config {
	return &Config{}
}

func (r *Config) LockAndLoad(ctx context.Context) (*config.Config, error) {
	r.lock.Lock()
	r.locked = true
	return r.data, nil
}

func (r *Config) Save(ctx context.Context, c *config.Config) error {
	if c != nil {
		r.data = c
	}
	return nil
}

func (r *Config) SaveAuth(ctx context.Context, c *config.Auth) error {
	if c != nil {
		if r.data == nil {
			r.data = &config.Config{}
		}
		r.data.Auth = c
	}
	return nil
}

func (r *Config) SaveAndUnlock(ctx context.Context, c *config.Config) error {
	_ = r.Save(ctx, c)
	return r.Unlock(ctx)
}

func (r *Config) Unlock(_ context.Context) error {
	if !r.locked {
		return nil
	}
	r.lock.Unlock()
	r.locked = false
	return nil
}
