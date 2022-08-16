package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/config"
)

type Config interface {
	LockAndLoad(context.Context) (*config.Config, error)
	Save(context.Context, *config.Config) error
	SaveAndUnlock(context.Context, *config.Config) error
	Unlock(context.Context) error
}
