package repo

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/config"
)

type Config interface {
	Load(context.Context) (*config.Config, error)
	Save(context.Context, *config.Config) error
}
