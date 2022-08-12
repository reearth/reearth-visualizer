package gateway

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin/pluginpack"
)

var ErrFailedToFetchDataFromPluginRegistry = errors.New("failed to fetch data from the plugin registry")

type PluginRegistry interface {
	FetchPluginPackage(context.Context, id.PluginID) (*pluginpack.Package, error)
}
