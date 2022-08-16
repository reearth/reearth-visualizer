package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type DBClient = *mongodoc.Client

type MigrationFunc = func(context.Context, DBClient) error

type Client struct {
	Client *mongodoc.Client
	Config repo.Config
}

func (c Client) Migrate(ctx context.Context) (err error) {
	config, err := c.Config.LockAndLoad(ctx)
	if err != nil {
		return fmt.Errorf("Failed to load config: %w", rerror.UnwrapErrInternal(err))
	}
	defer func() {
		if err2 := c.Config.Unlock(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	nextMigrations := config.NextMigrations(migrationKeys())
	if len(nextMigrations) == 0 {
		return nil
	}

	var tx repo.Tx
	defer func() {
		if tx != nil {
			if err2 := tx.End(ctx); err == nil && err2 != nil {
				err = err2
			}
		}
	}()

	for _, m := range nextMigrations {
		tx, err = c.Client.BeginTransaction()
		if err != nil {
			return err
		}

		log.Infof("DB migration: %d\n", m)
		if err := migrations[m](ctx, c.Client); err != nil {
			return fmt.Errorf("Failed to exec migration %d: %w", m, rerror.UnwrapErrInternal(err))
		}

		config.Migration = m
		if err := c.Config.Save(ctx, config); err != nil {
			return err
		}

		tx.Commit()
		if err := tx.End(ctx); err != nil {
			tx = nil
			return err
		}
		tx = nil
	}

	return nil
}

func migrationKeys() []int64 {
	keys := make([]int64, 0, len(migrations))
	for k := range migrations {
		keys = append(keys, k)
	}
	return keys
}
