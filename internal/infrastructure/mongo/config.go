package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/config"
	err1 "github.com/reearth/reearth-backend/pkg/error"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var upsert = true

type configRepo struct {
	client *mongodoc.ClientCollection
}

func NewConfig(client *mongodoc.Client) repo.Config {
	return &configRepo{client: client.WithCollection("config")}
}

func (r *configRepo) Load(ctx context.Context) (*config.Config, error) {
	cfg := &config.Config{}
	if err := r.client.Collection().FindOne(ctx, nil).Decode(cfg); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return cfg, nil
		}
		return nil, err1.ErrInternalBy(err)
	}
	return cfg, nil
}

func (r *configRepo) Save(ctx context.Context, cfg *config.Config) error {
	if cfg == nil {
		return nil
	}
	if _, err := r.client.Collection().UpdateOne(ctx, nil, cfg, &options.UpdateOptions{
		Upsert: &upsert,
	}); err != nil {
		return err1.ErrInternalBy(err)
	}
	return nil
}
