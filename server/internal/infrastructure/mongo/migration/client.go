package migration

import (
	"context"
	"errors"
	"sync"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/config"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/usecasex/migration"
)

// To add a new migration, do the following command:
// go run github.com/reearth/reearthx/tools migrategen -d internal/infrastructure/mongo/migration -t DBClient -n "foobar"

type DBClient = *mongox.Client

func Do(ctx context.Context, db *mongox.Client, config repo.Config) error {
	return migration.NewClient(db, NewConfig(config), migrations, 0).Migrate(ctx)
}

type Config struct {
	c       repo.Config
	locked  bool
	current config.Config
	m       sync.Mutex
}

func NewConfig(c repo.Config) *Config {
	return &Config{c: c}
}

func (c *Config) Begin(ctx context.Context) error {
	c.m.Lock()
	defer c.m.Unlock()

	conf, err := c.c.LockAndLoad(ctx)
	if conf != nil {
		c.current = *conf
	}
	if err == nil {
		c.locked = true
	}
	return err
}

func (c *Config) End(ctx context.Context) error {
	c.m.Lock()
	defer c.m.Unlock()

	if err := c.c.Unlock(ctx); err != nil {
		return err
	}
	c.locked = false
	return nil
}

func (c *Config) Current(ctx context.Context) (migration.Key, error) {
	if !c.locked {
		return 0, errors.New("config is not locked")
	}
	return c.current.Migration, nil
}

func (c *Config) Save(ctx context.Context, key migration.Key) error {
	c.m.Lock()
	defer c.m.Unlock()

	c.current.Migration = key
	return c.c.Save(ctx, &c.current)
}
