package gateway

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/manifest"
)

var (
	ErrFailedToFetchPluiginRepositoryData error = errors.New("failed to fetch repository data")
)

type PluginRepository interface {
	Manifest(context.Context, id.PluginID) (*manifest.Manifest, error)
	Data(context.Context, id.PluginID) (file.Iterator, error)
}
