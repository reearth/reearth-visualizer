package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/config"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const configLockName = "config"

type Config struct {
	client *mongo.Collection
	lock   repo.Lock
}

func NewConfig(client *mongo.Collection, lock repo.Lock) *Config {
	return &Config{client: client, lock: lock}
}

func (r *Config) LockAndLoad(ctx context.Context) (cfg *config.Config, err error) {
	if err := r.lock.Lock(ctx, configLockName); err != nil {
		return nil, err
	}

	cfgd := &mongodoc.ConfigDocument{}
	if err := r.client.FindOne(ctx, bson.M{}).Decode(cfgd); err != nil {
		if !errors.Is(err, mongo.ErrNilDocument) && !errors.Is(err, mongo.ErrNoDocuments) {
			return nil, rerror.ErrInternalByWithContext(ctx, err)
		}
	}
	return cfgd.Model(), nil
}

func (r *Config) Save(ctx context.Context, cfg *config.Config) error {
	if cfg == nil {
		return nil
	}

	if _, err := r.client.UpdateOne(
		ctx,
		bson.M{},
		bson.M{"$set": mongodoc.NewConfig(*cfg)},
		(&options.UpdateOptions{}).SetUpsert(true),
	); err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func (r *Config) SaveAuth(ctx context.Context, cfg *config.Auth) error {
	if cfg == nil {
		return nil
	}

	if _, err := r.client.UpdateOne(
		ctx,
		bson.M{},
		bson.M{"$set": bson.M{
			"auth": mongodoc.NewConfigAuth(cfg),
		}},
		(&options.UpdateOptions{}).SetUpsert(true),
	); err != nil {
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func (r *Config) SaveAndUnlock(ctx context.Context, cfg *config.Config) error {
	if err := r.Save(ctx, cfg); err != nil {
		return err
	}
	return r.Unlock(ctx)
}

func (r *Config) Unlock(ctx context.Context) error {
	if err := r.lock.Unlock(ctx, configLockName); err != nil && !errors.Is(err, repo.ErrNotLocked) {
		return err
	}

	return nil
}
