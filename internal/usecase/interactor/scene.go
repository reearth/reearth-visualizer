package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/layerops"
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
	file               gateway.File
}

func NewScene(r *repo.Container, g *gateway.Container) interfaces.Scene {
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
		file:               g.File,
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

func (i *Scene) AddWidget(ctx context.Context, sid id.SceneID, pid id.PluginID, eid id.PluginExtensionID, operator *usecase.Operator) (_ *scene.Scene, widget *scene.Widget, err error) {
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
	if err := i.CheckSceneLock(ctx, sid); err != nil {
		return nil, nil, err
	}

	s, err := i.sceneRepo.FindByID(ctx, sid, operator.WritableTeams)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteTeam(s.Team(), operator); err != nil {
		return nil, nil, err
	}

	_, extension, err := i.getPlugin(ctx, sid, pid, eid)
	if err != nil {
		return nil, nil, err
	}
	if extension.Type() != plugin.ExtensionTypeWidget {
		return nil, nil, interfaces.ErrExtensionTypeMustBeWidget
	}

	property, err := property.New().NewID().Schema(extension.Schema()).Scene(sid).Build()
	if err != nil {
		return nil, nil, err
	}

	extended := false
	floating := false
	var location *plugin.WidgetLocation
	if widgetLayout := extension.WidgetLayout(); widgetLayout != nil {
		extended = widgetLayout.Extended()
		floating = widgetLayout.Floating()
		location = widgetLayout.DefaultLocation()
	}

	widget, err = scene.NewWidget(
		id.NewWidgetID(),
		pid,
		eid,
		property.ID(),
		true,
		extended,
	)
	if err != nil {
		return nil, nil, err
	}

	s.WidgetSystem().Add(widget)

	if !floating {
		var loc scene.WidgetLocation
		if location != nil {
			loc = scene.WidgetLocation{
				Zone:    scene.WidgetZoneType(location.Zone),
				Section: scene.WidgetSectionType(location.Section),
				Area:    scene.WidgetAreaType(location.Area),
			}
		} else {
			loc = scene.WidgetLocation{
				Zone:    scene.WidgetZoneOuter,
				Section: scene.WidgetSectionLeft,
				Area:    scene.WidgetAreaTop,
			}
		}
		s.WidgetAlignSystem().Area(loc).Add(widget.ID(), -1)
	}

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

	widget := scene.WidgetSystem().Widget(param.WidgetID)
	if widget == nil {
		return nil, nil, rerror.ErrNotFound
	}
	_, location := scene.WidgetAlignSystem().Find(param.WidgetID)

	_, extension, err := i.getPlugin(ctx, scene.ID(), widget.Plugin(), widget.Extension())
	if err != nil {
		return nil, nil, err
	}
	if extension.Type() != plugin.ExtensionTypeWidget {
		return nil, nil, interfaces.ErrExtensionTypeMustBeWidget
	}

	if param.Enabled != nil {
		widget.SetEnabled(*param.Enabled)
	}

	if param.Location != nil || param.Index != nil {
		if param.Location != nil {
			location = *param.Location
		}
		index := -1
		if param.Index != nil {
			index = *param.Index
		}
		scene.WidgetAlignSystem().Move(widget.ID(), location, index)
	}

	if param.Extended != nil {
		widget.SetExtended(*param.Extended)
	}

	// check extendable
	if layout := extension.WidgetLayout(); layout != nil {
		extendable := layout.Extendable(plugin.WidgetLocation{
			Zone:    plugin.WidgetZoneType(location.Zone),
			Section: plugin.WidgetSectionType(location.Section),
			Area:    plugin.WidgetAreaType(location.Area),
		})
		if e := widget.Extended(); !extendable && e {
			widget.SetExtended(false)
		}
	}

	err2 = i.sceneRepo.Save(ctx, scene)
	if err2 != nil {
		return nil, nil, err2
	}

	tx.Commit()
	return scene, widget, nil
}

func (i *Scene) UpdateWidgetAlignSystem(ctx context.Context, param interfaces.UpdateWidgetAlignSystemParam, operator *usecase.Operator) (_ *scene.Scene, err error) {
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

	// check scene lock
	if err := i.CheckSceneLock(ctx, param.SceneID); err != nil {
		return nil, err
	}

	scene, err2 := i.sceneRepo.FindByID(ctx, param.SceneID, operator.WritableTeams)
	if err2 != nil {
		return nil, err2
	}
	if err := i.CanWriteTeam(scene.Team(), operator); err != nil {
		return nil, err
	}

	area := scene.WidgetAlignSystem().Area(param.Location)

	if area == nil {
		return nil, errors.New("invalid location")
	}

	if param.Align != nil {
		area.SetAlignment(*param.Align)
	}

	if err = i.sceneRepo.Save(ctx, scene); err != nil {
		return nil, err
	}

	tx.Commit()
	return scene, nil
}

func (i *Scene) RemoveWidget(ctx context.Context, id id.SceneID, wid id.WidgetID, operator *usecase.Operator) (_ *scene.Scene, err error) {
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

	widget := ws.Widget(wid)
	if widget == nil {
		return nil, rerror.ErrNotFound
	}

	ws.Remove(wid)
	scene.WidgetAlignSystem().Remove(wid)

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

	plugin, err := i.pluginRepo.FindByID(ctx, pid, []id.SceneID{sid})
	if err != nil {
		if errors.Is(err2, rerror.ErrNotFound) {
			return nil, pid, nil, interfaces.ErrPluginNotFound
		}
		return nil, pid, nil, err
	}
	if psid := plugin.ID().Scene(); psid != nil && *psid != sid {
		return nil, pid, nil, interfaces.ErrPluginNotFound
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
		if err := i.propertyRepo.Save(ctx, p); err != nil {
			return nil, pid, nil, err2
		}
	}

	if err := i.sceneRepo.Save(ctx, s); err != nil {
		return nil, pid, nil, err2
	}

	tx.Commit()
	return s, pid, propertyID, nil
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

	pl, err := i.pluginRepo.FindByID(ctx, pid, []id.SceneID{sid})
	if err != nil {
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
	removedProperties = append(removedProperties, scene.WidgetSystem().RemoveAllByPlugin(pid)...)

	// remove layers
	res, err := layerops.Processor{
		LayerLoader: repo.LayerLoaderFrom(i.layerRepo, []id.SceneID{sid}),
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

	if res.RemovedLayers.LayerCount() > 0 {
		if err := i.layerRepo.RemoveAll(ctx, res.RemovedLayers.Layers()); err != nil {
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

func (i *Scene) getPlugin(ctx context.Context, sid id.SceneID, p id.PluginID, e id.PluginExtensionID) (*plugin.Plugin, *plugin.Extension, error) {
	plugin, err2 := i.pluginRepo.FindByID(ctx, p, []id.SceneID{sid})
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
