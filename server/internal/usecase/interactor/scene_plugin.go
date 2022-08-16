package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer/layerops"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/scene/sceneops"
)

func (i *Scene) InstallPlugin(ctx context.Context, sid id.SceneID, pid id.PluginID, operator *usecase.Operator) (_ *scene.Scene, _ *id.PropertyID, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, sid)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteTeam(s.Team(), operator); err != nil {
		return nil, nil, err
	}

	if s.Plugins().HasPlugin(pid) {
		return nil, nil, interfaces.ErrPluginAlreadyInstalled
	}

	plugin, err := i.pluginCommon().GetOrDownloadPlugin(ctx, pid)
	if err != nil {
		if errors.Is(rerror.ErrNotFound, err) {
			return nil, nil, interfaces.ErrPluginNotFound
		}
		return nil, nil, err
	}
	if plugin == nil {
		return nil, nil, interfaces.ErrPluginNotFound
	}
	if psid := plugin.ID().Scene(); psid != nil && *psid != sid {
		return nil, nil, interfaces.ErrPluginNotFound
	}

	var p *property.Property
	if schema := plugin.Schema(); schema != nil {
		p, err = property.New().NewID().Schema(*schema).Scene(sid).Build()
		if err != nil {
			return nil, nil, err
		}
	}

	s.Plugins().Add(scene.NewPlugin(pid, p.IDRef()))

	if p != nil {
		if err := i.propertyRepo.Save(ctx, p); err != nil {
			return nil, nil, err
		}
	}

	if err := i.sceneRepo.Save(ctx, s); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return s, p.IDRef(), nil
}

func (i *Scene) UninstallPlugin(ctx context.Context, sid id.SceneID, pid id.PluginID, operator *usecase.Operator) (_ *scene.Scene, err error) {
	if pid.System() {
		return nil, rerror.ErrNotFound
	}

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scene, err := i.sceneRepo.FindByID(ctx, sid)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteTeam(scene.Team(), operator); err != nil {
		return nil, err
	}

	pl, err := i.pluginRepo.FindByID(ctx, pid)
	if err != nil {
		if errors.Is(rerror.ErrNotFound, err) {
			return nil, interfaces.ErrPluginNotFound
		}
		return nil, err
	}

	ps := scene.Plugins()
	if !ps.Has(pid) {
		return nil, interfaces.ErrPluginNotInstalled
	}

	removedProperties := []id.PropertyID{}

	// remove plugin
	if p := ps.Property(pid); p != nil {
		removedProperties = append(removedProperties, *p)
	}
	ps.Remove(pid)

	// remove widgets
	removedProperties = append(removedProperties, scene.Widgets().RemoveAllByPlugin(pid, nil)...)

	// remove blocks
	res, err := layerops.Processor{
		LayerLoader: repo.LayerLoaderFrom(i.layerRepo),
		RootLayerID: scene.RootLayer(),
	}.UninstallPlugin(ctx, pid)
	if err != nil {
		return nil, err
	}

	removedProperties = append(removedProperties, res.RemovedProperties...)

	// save
	if len(res.ModifiedLayers) > 0 {
		if err := i.layerRepo.SaveAll(ctx, res.ModifiedLayers); err != nil {
			return nil, err
		}
	}

	if len(removedProperties) > 0 {
		if err := i.propertyRepo.RemoveAll(ctx, removedProperties); err != nil {
			return nil, err
		}
	}

	if err := i.sceneRepo.Save(ctx, scene); err != nil {
		return nil, err
	}

	// if the plugin is private, uninstall it
	if psid := pid.Scene(); psid != nil && *psid == sid {
		if err := i.pluginRepo.Remove(ctx, pl.ID()); err != nil {
			return nil, err
		}
		if ps := pl.PropertySchemas(); len(ps) > 0 {
			if err := i.propertySchemaRepo.RemoveAll(ctx, ps); err != nil {
				return nil, err
			}
		}
		if err := i.file.RemovePlugin(ctx, pl.ID()); err != nil {
			return nil, err
		}
	}

	tx.Commit()
	return scene, nil
}

func (i *Scene) UpgradePlugin(ctx context.Context, sid id.SceneID, oldPluginID, newPluginID id.PluginID, operator *usecase.Operator) (_ *scene.Scene, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, sid)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteTeam(s.Team(), operator); err != nil {
		return nil, err
	}

	if oldPluginID.IsNil() || newPluginID.IsNil() || oldPluginID.Equal(newPluginID) || !oldPluginID.NameEqual(newPluginID) {
		return nil, interfaces.ErrCannotUpgradeToPlugin
	}

	if !s.Plugins().Has(oldPluginID) {
		return nil, interfaces.ErrPluginNotInstalled
	}

	if plugin, err := i.pluginCommon().GetOrDownloadPlugin(ctx, newPluginID); err != nil {
		return nil, err
	} else if plugin == nil {
		return nil, interfaces.ErrPluginNotFound
	}

	pluginMigrator := sceneops.PluginMigrator{
		Property:       repo.PropertyLoaderFrom(i.propertyRepo),
		PropertySchema: repo.PropertySchemaLoaderFrom(i.propertySchemaRepo),
		Dataset:        repo.DatasetLoaderFrom(i.datasetRepo),
		Layer:          repo.LayerLoaderBySceneFrom(i.layerRepo),
		Plugin:         repo.PluginLoaderFrom(i.pluginRepo),
	}

	result, err := pluginMigrator.MigratePlugins(ctx, s, oldPluginID, newPluginID)

	if err := i.sceneRepo.Save(ctx, result.Scene); err != nil {
		return nil, err
	}
	if err := i.propertyRepo.SaveAll(ctx, result.Properties); err != nil {
		return nil, err
	}
	if err := i.layerRepo.SaveAll(ctx, result.Layers); err != nil {
		return nil, err
	}
	if err := i.layerRepo.RemoveAll(ctx, result.RemovedLayers); err != nil {
		return nil, err
	}
	if err := i.propertyRepo.RemoveAll(ctx, result.RemovedProperties); err != nil {
		return nil, err
	}

	tx.Commit()
	return result.Scene, err
}
