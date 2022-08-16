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

type configRepo struct {
	client *mongodoc.ClientCollection
	lock   repo.Lock
}

func NewConfig(client *mongodoc.Client, lock repo.Lock) repo.Config {
	return &configRepo{client: client.WithCollection("config"), lock: lock}
}

func (r *configRepo) LockAndLoad(ctx context.Context) (cfg *config.Config, err error) {
	if err := r.lock.Lock(ctx, configLockName); err != nil {
		return nil, err
	}

	cfgd := &mongodoc.ConfigDocument{}
	if err := r.client.Collection().FindOne(ctx, bson.M{}).Decode(cfgd); err != nil {
		if !errors.Is(err, mongo.ErrNilDocument) && !errors.Is(err, mongo.ErrNoDocuments) {
			return nil, rerror.ErrInternalBy(err)
		}
	}
	return cfgd.Model(), nil
}

func (r *configRepo) Save(ctx context.Context, cfg *config.Config) error {
	if cfg != nil {
		if _, err := r.client.Collection().UpdateOne(
			ctx,
			bson.M{},
			bson.M{"$set": mongodoc.NewConfig(*cfg)},
			(&options.UpdateOptions{}).SetUpsert(true),
		); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	return nil
}

func (r *configRepo) SaveAndUnlock(ctx context.Context, cfg *config.Config) error {
	if err := r.Save(ctx, cfg); err != nil {
		return err
	}
	return r.Unlock(ctx)
}

func (r *configRepo) Unlock(ctx context.Context) error {
	if err := r.lock.Unlock(ctx, configLockName); err != nil && !errors.Is(err, repo.ErrNotLocked) {
		return err
	}

	return nil
}
