package gateway

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/plugin"
)

var ErrFailedToFetchDataFromPluginRegistry = errors.New("failed to fetch data from the plugin registry")

type PluginRegistry interface {
	FetchMetadata(ctx context.Context) ([]*plugin.Metadata, error)
}
