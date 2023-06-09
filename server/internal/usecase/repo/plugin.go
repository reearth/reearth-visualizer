package repo

import (
	"context"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
)

type Plugin interface {
	Filtered(SceneFilter) Plugin
	FindByID(context.Context, id.PluginID) (*plugin.Plugin, error)
	FindByIDs(context.Context, []id.PluginID) ([]*plugin.Plugin, error)
	Save(context.Context, *plugin.Plugin) error
	Remove(context.Context, id.PluginID) error
}

func PluginLoaderFrom(r Plugin) plugin.Loader {
	return func(ctx context.Context, ids []id.PluginID) (plugin.List, error) {
		return r.FindByIDs(ctx, ids)
	}
}
