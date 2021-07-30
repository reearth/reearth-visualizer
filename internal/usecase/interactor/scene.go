package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/scene/sceneops"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

type Scene struct {
	commonScene
	commonSceneLock
	sceneRepo          repo.Scene
	sceneLockRepo      repo.SceneLock
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	projectRepo        repo.Project
	pluginRepo         repo.Plugin
	layerRepo          repo.Layer
	datasetRepo        repo.Dataset
	transaction        repo.Transaction
}

func NewScene(r *repo.Container) interfaces.Scene {
	return &Scene{
		commonScene:        commonScene{sceneRepo: r.Scene},
		commonSceneLock:    commonSceneLock{sceneLockRepo: r.SceneLock},
		sceneRepo:          r.Scene,
		sceneLockRepo:      r.SceneLock,
		propertyRepo:       r.Property,
		propertySchemaRepo: r.PropertySchema,
		projectRepo:        r.Project,
		pluginRepo:         r.Plugin,
		layerRepo:          r.Layer,
		datasetRepo:        r.Dataset,
		transaction:        r.Transaction,
	}
}

func (i *Scene) Fetch(ctx context.Context, ids []id.SceneID, operator *usecase.Operator) ([]*scene.Scene, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	return i.sceneRepo.FindByIDs(ctx, ids, operator.ReadableTeams)
}

func (i *Scene) FindByProject(ctx context.Context, id id.ProjectID, operator *usecase.Operator) (*scene.Scene, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.sceneRepo.FindByProject(ctx, id, operator.ReadableTeams)
	return res, err
}

func (i *Scene) Create(ctx context.Context, pid id.ProjectID, operator *usecase.Operator) (_ *scene.Scene, err error) {

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

	prj, err := i.projectRepo.FindByID(ctx, pid, operator.WritableTeams)
	if err != nil {
		return nil, err
	}

	if err := i.CanWriteTeam(prj.Team(), operator); err != nil {
		return nil, err
	}

	schema := builtin.GetPropertySchemaByVisualizer(visualizer.VisualizerCesium)
	sceneID := id.NewSceneID()

	rootLayer, err := layer.NewGroup().NewID().Scene(sceneID).Root(true).Build()
	if err != nil {
		return nil, err
	}

	ps := scene.NewPluginSystem([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})

	p, err := property.New().NewID().Schema(schema.ID()).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}

	// add default tile
	tiles := id.PropertySchemaFieldID("tiles")
	g := p.GetOrCreateGroupList(schema, property.PointItemBySchema(tiles))
	g.Add(property.NewGroup().NewID().Schema(schema.ID(), tiles).MustBuild(), -1)

	scene, err := scene.New().
		ID(sceneID).
		Project(pid).
		Team(prj.Team()).
		Property(p.ID()).
		RootLayer(rootLayer.ID()).
		PluginSystem(ps).
		Build()

	if err != nil {
		return nil, err
	}

	if p != nil {
		err = i.propertyRepo.Save(ctx, p)
		if err != nil {
			return nil, err
		}
	}

	err = i.layerRepo.Save(ctx, rootLayer)
	if err != nil {
		return nil, err
	}

	err = i.sceneRepo.Save(ctx, scene)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return scene, err
}

func (s *Scene) FetchLock(ctx context.Context, ids []id.SceneID, operator *usecase.Operator) ([]scene.LockMode, error) {
	if err := s.OnlyOperator(operator); err != nil {
		return nil, err
	}
	return s.sceneLockRepo.GetAllLock(ctx, ids)
}

func (i *Scene) AddWidget(ctx context.Context, id id.SceneID, pid id.PluginID, eid id.PluginExtensionID, operator *usecase.Operator) (_ *scene.Scene, widget *scene.Widget, err error) {

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
		return nil, nil, interfaces.ErrOperationDenied
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, id); err != nil {
		return nil, nil, err
	}

	s, err := i.sceneRepo.FindByID(ctx, id, operator.WritableTeams)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteTeam(s.Team(), operator); err != nil {
		return nil, nil, err
	}

	_, extension, err := i.getPlugin(ctx, pid, eid)
	if err != nil {
		return nil, nil, err
	}
	if extension.Type() != plugin.ExtensionTypeWidget {
		return nil, nil, interfaces.ErrExtensionTypeMustBeWidget
	}

	property, err := property.New().NewID().Schema(extension.Schema()).Scene(id).Build()
	if err != nil {
		return nil, nil, err
	}

	widget, err = scene.NewWidget(nil, pid, eid, property.ID(), true)
	if err != nil {
		return nil, nil, err
	}

	s.WidgetSystem().Add(widget)

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, nil, err
	}

	err = i.sceneRepo.Save(ctx, s)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return s, widget, nil
}

func (i *Scene) UpdateWidget(ctx context.Context, param interfaces.UpdateWidgetParam, operator *usecase.Operator) (_ *scene.Scene, _ *scene.Widget, err error) {

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
		return nil, nil, interfaces.ErrOperationDenied
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, param.SceneID); err != nil {
		return nil, nil, err
	}

	scene, err2 := i.sceneRepo.FindByID(ctx, param.SceneID, operator.WritableTeams)
	if err2 != nil {
		return nil, nil, err2
	}
	if err := i.CanWriteTeam(scene.Team(), operator); err != nil {
		return nil, nil, err
	}

	ws := scene.WidgetSystem()
	widget := ws.Widget(param.PluginID, param.ExtensionID)
	if widget == nil {
		return nil, nil, rerror.ErrNotFound
	}

	if param.Enabled != nil {
		widget.SetEnabled(*param.Enabled)
	}

	err2 = i.sceneRepo.Save(ctx, scene)
	if err2 != nil {
		return nil, nil, err2
	}

	tx.Commit()
	return scene, widget, nil
}

func (i *Scene) RemoveWidget(ctx context.Context, id id.SceneID, pid id.PluginID, eid id.PluginExtensionID, operator *usecase.Operator) (_ *scene.Scene, err error) {

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
		return nil, interfaces.ErrOperationDenied
	}

	scene, err2 := i.sceneRepo.FindByID(ctx, id, operator.WritableTeams)
	if err2 != nil {
		return nil, err2
	}
	if err := i.CanWriteTeam(scene.Team(), operator); err != nil {
		return nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, id); err != nil {
		return nil, err
	}

	ws := scene.WidgetSystem()

	widget := ws.Widget(pid, eid)
	if widget == nil {
		return nil, rerror.ErrNotFound
	}

	ws.Remove(pid, eid)

	err2 = i.propertyRepo.Remove(ctx, widget.Property())
	if err2 != nil {
		return nil, err2
	}

	err2 = i.sceneRepo.Save(ctx, scene)
	if err2 != nil {
		return nil, err2
	}

	tx.Commit()
	return scene, nil
}

func (i *Scene) InstallPlugin(ctx context.Context, sid id.SceneID, pid id.PluginID, operator *usecase.Operator) (_ *scene.Scene, _ id.PluginID, _ *id.PropertyID, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, pid, nil, interfaces.ErrOperationDenied
	}

	s, err2 := i.sceneRepo.FindByID(ctx, sid, operator.WritableTeams)
	if err2 != nil {
		return nil, pid, nil, err2
	}
	if err := i.CanWriteTeam(s.Team(), operator); err != nil {
		return nil, pid, nil, err
	}

	// check scene lock
	if err2 := i.CheckSceneLock(ctx, sid); err2 != nil {
		return nil, pid, nil, err2
	}

	if s.PluginSystem().HasPlugin(pid) {
		return nil, pid, nil, interfaces.ErrPluginAlreadyInstalled
	}

	plugin, err2 := i.pluginRepo.FindByID(ctx, pid)
	if err2 != nil {
		if errors.Is(err2, rerror.ErrNotFound) {
			//
			// Install Plugin
			//
			return nil, pid, nil, interfaces.ErrPluginNotFound
		}
		return nil, pid, nil, err2
	}

	var p *property.Property
	var propertyID *id.PropertyID
	schema := plugin.Schema()
	if schema != nil {
		pr, err := property.New().NewID().Schema(*schema).Scene(sid).Build()
		if err != nil {
			return nil, pid, nil, err
		}
		prid := pr.ID()
		p = pr
		propertyID = &prid
	}

	s.PluginSystem().Add(scene.NewPlugin(pid, propertyID))

	if p != nil {
		err2 = i.propertyRepo.Save(ctx, p)
		if err2 != nil {
			return nil, pid, nil, err2
		}
	}

	err2 = i.sceneRepo.Save(ctx, s)
	if err2 != nil {
		return nil, pid, nil, err2
	}

	tx.Commit()
	return s, pid, propertyID, nil
}

func (i *Scene) UninstallPlugin(ctx context.Context, sid id.SceneID, pid id.PluginID, operator *usecase.Operator) (_ *scene.Scene, err error) {

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

	scene, err := i.sceneRepo.FindByID(ctx, sid, operator.WritableTeams)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteTeam(scene.Team(), operator); err != nil {
		return nil, err
	}

	// check scene lock
	if err := i.CheckSceneLock(ctx, sid); err != nil {
		return nil, err
	}

	ps := scene.PluginSystem()
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
	for _, w := range scene.WidgetSystem().Widgets() {
		if w.Plugin().Equal(pid) {
			scene.WidgetSystem().Remove(pid, w.Extension())
			removedProperties = append(removedProperties, w.Property())
		}
	}

	// remove layers and infobox fields
	modifiedLayers := layer.List{}
	removedLayers := []id.LayerID{}
	layers, err := i.layerRepo.FindByScene(ctx, sid)
	if err != nil {
		return nil, err
	}
	for _, l := range layers {
		if l == nil {
			continue
		}
		ll := *l
		if p := ll.Plugin(); p != nil && pid.Equal(*p) {
			removedLayers = append(removedLayers, ll.ID())
			if pp := ll.Property(); pp != nil {
				removedProperties = append(removedProperties, *pp)
			}
			if ib := ll.Infobox(); ib != nil {
				removedProperties = append(removedProperties, ib.Property())
				for _, f := range ib.Fields() {
					removedProperties = append(removedProperties, f.Property())
				}
			}
		} else if ib := ll.Infobox(); ib != nil {
			removedProperties = append(removedProperties, ib.Property())
			for _, f := range ib.Fields() {
				removedProperties = append(removedProperties, f.Property())
			}
			var ll2 layer.Layer = ll
			modifiedLayers = append(modifiedLayers, &ll2)
		}
	}
	for _, lg := range layers.ToLayerGroupList() {
		modified := false
		cancel := false
		for _, lid := range removedLayers {
			if lg.ID() == lid {
				cancel = true
				break
			}
			if lg.Layers().HasLayer(lid) {
				lg.Layers().RemoveLayer(lid)
				modified = true
			}
		}
		if cancel {
			continue
		}
		if modified {
			already := false
			for _, l := range modifiedLayers {
				if l != nil && (*l).ID() == lg.ID() {
					already = true
					break
				}
			}
			if already {
				continue
			}
			var lg2 layer.Layer = lg
			modifiedLayers = append(modifiedLayers, &lg2)
		}
	}

	if len(modifiedLayers) > 0 {
		err = i.layerRepo.SaveAll(ctx, modifiedLayers)
		if err != nil {
			return nil, err
		}
	}
	if len(removedLayers) > 0 {
		err = i.layerRepo.RemoveAll(ctx, removedLayers)
		if err != nil {
			return nil, err
		}
	}
	err = i.sceneRepo.Save(ctx, scene)
	if err != nil {
		return nil, err
	}
	if len(removedProperties) > 0 {
		err = i.propertyRepo.RemoveAll(ctx, removedProperties)
		if err != nil {
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

	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}

	s, err := i.sceneRepo.FindByID(ctx, sid, operator.WritableTeams)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteTeam(s.Team(), operator); err != nil {
		return nil, err
	}

	if err := i.UpdateSceneLock(ctx, sid, scene.LockModeFree, scene.LockModePluginUpgrading); err != nil {
		return nil, err
	}

	defer i.ReleaseSceneLock(ctx, sid)

	scenes := []id.SceneID{s.ID()}
	pluginMigrator := sceneops.PluginMigrator{
		Property:       repo.PropertyLoaderFrom(i.propertyRepo, scenes),
		PropertySchema: repo.PropertySchemaLoaderFrom(i.propertySchemaRepo),
		Dataset:        repo.DatasetLoaderFrom(i.datasetRepo, scenes),
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

func (i *Scene) getPlugin(ctx context.Context, p id.PluginID, e id.PluginExtensionID) (*plugin.Plugin, *plugin.Extension, error) {
	plugin, err2 := i.pluginRepo.FindByID(ctx, p)
	if err2 != nil {
		if errors.Is(err2, rerror.ErrNotFound) {
			return nil, nil, interfaces.ErrPluginNotFound
		}
		return nil, nil, err2
	}

	extension := plugin.Extension(e)
	if extension == nil {
		return nil, nil, interfaces.ErrExtensionNotFound
	}

	return plugin, extension, nil
}
