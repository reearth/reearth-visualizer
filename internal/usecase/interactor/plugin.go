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
}

func NewPlugin(r *repo.Container, gr *gateway.Container) interfaces.Plugin {
	return &Plugin{
		pluginRepo:         r.Plugin,
		propertySchemaRepo: r.PropertySchema,
		transaction:        r.Transaction,
		pluginRepository:   gr.PluginRepository,
		file:               gr.File,
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
		err = tx.End(ctx)
	}()

	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}

	tx.Commit()
	return nil, errors.New("not implemented")
}
