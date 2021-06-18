package gateway

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/plugin"
)

type PluginRegistry interface {
	FetchMetadata(ctx context.Context) ([]*plugin.Metadata, error)
}
