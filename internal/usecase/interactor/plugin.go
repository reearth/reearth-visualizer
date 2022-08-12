package interactor

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

type Plugin struct {
	common
	sceneRepo          repo.Scene
	pluginRepo         repo.Plugin
	propertySchemaRepo repo.PropertySchema
	propertyRepo       repo.Property
	layerRepo          repo.Layer
	file               gateway.File
	transaction        repo.Transaction
	pluginRegistry     gateway.PluginRegistry
}

func NewPlugin(r *repo.Container, gr *gateway.Container) interfaces.Plugin {
	return &Plugin{
		sceneRepo:          r.Scene,
		layerRepo:          r.Layer,
		pluginRepo:         r.Plugin,
		propertySchemaRepo: r.PropertySchema,
		propertyRepo:       r.Property,
		transaction:        r.Transaction,
		file:               gr.File,
		pluginRegistry:     gr.PluginRegistry,
	}
}

func (i *Plugin) pluginCommon() *pluginCommon {
	return &pluginCommon{
		pluginRepo:         i.pluginRepo,
		propertySchemaRepo: i.propertySchemaRepo,
		file:               i.file,
		pluginRegistry:     i.pluginRegistry,
	}
}

func (i *Plugin) Fetch(ctx context.Context, ids []id.PluginID, operator *usecase.Operator) ([]*plugin.Plugin, error) {
	return i.pluginRepo.FindByIDs(ctx, ids)
}
