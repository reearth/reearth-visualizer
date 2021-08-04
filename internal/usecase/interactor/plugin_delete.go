package interactor

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/id"
)

func (i *Plugin) Delete(ctx context.Context, pid id.PluginID, operator *usecase.Operator) (err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err := i.pluginRepo.FindByID(ctx, pid, nil)
	if err != nil {
		return err
	}

	sid := p.ID().Scene()
	if sid == nil || p.ID().System() {
		return interfaces.ErrCannotDeletePublicPlugin
	}

	s, err := i.sceneRepo.FindByID(ctx, *sid, operator.WritableTeams)
	if err != nil {
		return err
	}
	if s == nil {
		return interfaces.ErrOperationDenied
	}

	if s.PluginSystem().HasPlugin(p.ID()) {
		return interfaces.ErrCannotDeleteUsedPlugin
	}

	if err := i.pluginRepo.Remove(ctx, p.ID()); err != nil {
		return err
	}
	if ps := p.PropertySchemas(); len(ps) > 0 {
		if err := i.propertySchemaRepo.RemoveAll(ctx, ps); err != nil {
			return err
		}
	}
	if err := i.file.RemovePlugin(ctx, p.ID()); err != nil {
		return err
	}

	tx.Commit()
	return nil
}
