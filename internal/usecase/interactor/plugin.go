package interactor

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

type Plugin struct {
	common
	pluginRepo         repo.Plugin
	propertySchemaRepo repo.PropertySchema
	file               gateway.File
	pluginRepository   gateway.PluginRepository
	transaction        repo.Transaction
	pluginRegistry     gateway.PluginRegistry
}

func NewPlugin(r *repo.Container, gr *gateway.Container) interfaces.Plugin {
	return &Plugin{
		pluginRepo:         r.Plugin,
		propertySchemaRepo: r.PropertySchema,
		transaction:        r.Transaction,
		pluginRepository:   gr.PluginRepository,
		file:               gr.File,
		pluginRegistry:     gr.PluginRegistry,
	}
}

func (i *Plugin) Fetch(ctx context.Context, ids []id.PluginID, operator *usecase.Operator) ([]*plugin.Plugin, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.pluginRepo.FindByIDs(ctx, ids)
	return res, err
}

func (i *Plugin) Upload(ctx context.Context, r io.Reader, operator *usecase.Operator) (_ *plugin.Plugin, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}

	tx.Commit()
	return nil, errors.New("not implemented")
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
