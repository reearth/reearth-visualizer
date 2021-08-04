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
	commonScene
	pluginRepo         repo.Plugin
	propertySchemaRepo repo.PropertySchema
	propertyRepo       repo.Property
	file               gateway.File
	pluginRepository   gateway.PluginRepository
	transaction        repo.Transaction
	pluginRegistry     gateway.PluginRegistry
}

func NewPlugin(r *repo.Container, gr *gateway.Container) interfaces.Plugin {
	return &Plugin{
		commonScene: commonScene{
			sceneRepo: r.Scene,
		},
		pluginRepo:         r.Plugin,
		propertySchemaRepo: r.PropertySchema,
		propertyRepo:       r.Property,
		transaction:        r.Transaction,
		pluginRepository:   gr.PluginRepository,
		file:               gr.File,
		pluginRegistry:     gr.PluginRegistry,
	}
}

func (i *Plugin) Fetch(ctx context.Context, ids []id.PluginID, operator *usecase.Operator) ([]*plugin.Plugin, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	res, err := i.pluginRepo.FindByIDs(ctx, ids, scenes)
	return res, err
}

func (i *Plugin) FetchPluginMetadata(ctx context.Context, operator *usecase.Operator) ([]*plugin.Metadata, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}

	res, err := i.pluginRegistry.FetchMetadata(ctx)
	if err != nil {
		return nil, err
	}

	return res, nil
}
