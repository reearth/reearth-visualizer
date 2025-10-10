package interactor

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Scene struct {
	common
	assetRepo          repo.Asset
	sceneRepo          repo.Scene
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	projectRepo        repo.Project
	pluginRepo         repo.Plugin
	transaction        usecasex.Transaction
	file               gateway.File
	pluginRegistry     gateway.PluginRegistry
	extensions         []id.PluginID
	nlsLayerRepo       repo.NLSLayer
	layerStyles        repo.Style
	storytellingRepo   repo.Storytelling
}

func NewScene(r *repo.Container, g *gateway.Container) interfaces.Scene {
	return &Scene{
		assetRepo:          r.Asset,
		sceneRepo:          r.Scene,
		propertyRepo:       r.Property,
		propertySchemaRepo: r.PropertySchema,
		projectRepo:        r.Project,
		pluginRepo:         r.Plugin,
		transaction:        r.Transaction,
		file:               g.File,
		pluginRegistry:     g.PluginRegistry,
		extensions:         r.Extensions,
		nlsLayerRepo:       r.NLSLayer,
		layerStyles:        r.Style,
		storytellingRepo:   r.Storytelling,
	}
}

func (i *Scene) pluginCommon() *pluginCommon {
	return &pluginCommon{
		pluginRepo:         i.pluginRepo,
		propertySchemaRepo: i.propertySchemaRepo,
		file:               i.file,
		pluginRegistry:     i.pluginRegistry,
	}
}

func (i *Scene) Fetch(ctx context.Context, ids []id.SceneID, operator *usecase.Operator) ([]*scene.Scene, error) {
	s, err := i.sceneRepo.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	lo.ForEach(s, func(s *scene.Scene, _ int) {
		injectExtensionsToScene(s, i.extensions)
	})

	return s, nil
}

func (i *Scene) FindByProject(ctx context.Context, id id.ProjectID, operator *usecase.Operator) (*scene.Scene, error) {
	s, err := i.sceneRepo.FindByProject(ctx, id)
	if err != nil {
		return nil, err
	}
	injectExtensionsToScene(s, i.extensions)
	return s, nil
}

func (i *Scene) FindByProjectsWithStory(ctx context.Context, ids []id.ProjectID, operator *usecase.Operator) ([]*scene.Scene, *storytelling.StoryList, error) {
	scenes, err := i.sceneRepo.FindByProjects(ctx, ids)
	if err != nil {
		return nil, nil, err
	}

	var sids []id.SceneID
	for _, s := range scenes {
		injectExtensionsToScene(s, i.extensions)
		sids = append(sids, s.ID())
	}

	storytellings, err := i.storytellingRepo.FindByScenes(ctx, sids)
	if err != nil {
		return nil, nil, err
	}

	return scenes, storytellings, nil
}

func (i *Scene) Create(ctx context.Context, pid id.ProjectID, defaultExtensionWidget bool, operator *usecase.Operator) (_ *scene.Scene, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}
	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	prj, err := i.projectRepo.FindByID(ctx, pid)
	if err != nil {
		return nil, err
	}
	ws := prj.Workspace()
	if err := i.CanWriteWorkspace(ws, operator); err != nil {
		return nil, err
	}

	sceneID := id.NewSceneID()

	prj.UpdateAlias(alias.ReservedReearthPrefixScene + sceneID.String())
	if err := i.projectRepo.Save(ctx, prj); err != nil {
		return nil, err
	}

	prop, err := i.addDefaultVisualizerTilesProperty(ctx, sceneID, prj.CoreSupport())
	if err != nil {
		return nil, err
	}

	officialPlugins := scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})

	res, err := scene.New().
		ID(sceneID).
		Project(pid).
		Workspace(ws).
		Property(prop.ID()).
		Plugins(officialPlugins).
		Alias(alias.ReservedReearthPrefixScene + sceneID.String()).
		Build()
	if err != nil {
		return nil, err
	}

	// For ProjectImport, it is included in the import data, so it is not necessary.
	if defaultExtensionWidget {
		if err = i.addDefaultExtensionWidget(ctx, sceneID, res); err != nil {
			return nil, err
		}
	}

	if err = i.sceneRepo.Save(ctx, res); err != nil {
		return nil, err
	}

	if err := updateProjectUpdatedAt(ctx, prj, i.projectRepo); err != nil {
		return nil, err
	}

	operator.AddNewScene(ws, sceneID)
	tx.Commit()
	return res, nil
}

func (i *Scene) addDefaultVisualizerTilesProperty(ctx context.Context, sceneID id.SceneID, coreSupport bool) (*property.Property, error) {

	viz := visualizer.VisualizerCesium
	if coreSupport {
		viz = visualizer.VisualizerCesiumBeta
	}

	visualizerSchema := builtin.GetPropertySchemaByVisualizer(viz)

	prop, err := property.New().NewID().Schema(visualizerSchema.ID()).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}

	tiles := id.PropertySchemaGroupID("tiles")
	g := prop.GetOrCreateGroupList(visualizerSchema, property.PointItemBySchema(tiles))
	g.Add(property.NewGroup().NewID().SchemaGroup(tiles).MustBuild(), -1)

	filter := Filter(sceneID)
	if err = i.propertyRepo.Filtered(filter).Save(ctx, prop); err != nil {
		return nil, err
	}

	return prop, nil
}

func (i *Scene) addDefaultExtensionWidget(ctx context.Context, sceneID id.SceneID, sce *scene.Scene) error {

	widget, location, err := i.buidDataAttribution(ctx, sceneID)
	if err != nil {
		return err
	}
	// Type Desktop Attribution
	sce.Widgets().Add(widget)

	if location != nil {
		// Type Desktop Location
		sce.Widgets().Alignment().System(scene.WidgetAlignSystemTypeDesktop).Area(*location).Add(widget.ID(), -1)
	}

	widget, location, err = i.buidDataAttribution(ctx, sceneID)
	if err != nil {
		return err
	}
	// Type Mobile Attribution
	sce.Widgets().Add(widget)

	if location != nil {
		// Type Mobile Location
		sce.Widgets().Alignment().System(scene.WidgetAlignSystemTypeMobile).Area(*location).Add(widget.ID(), -1)
	}

	return nil
}

func (i *Scene) buidDataAttribution(ctx context.Context, sceneID id.SceneID) (*scene.Widget, *scene.WidgetLocation, error) {
	filter := Filter(sceneID)

	pluginID, extensionID, extension, err := i.getWidgePluginWithID(ctx, "reearth", "dataAttribution", &filter)
	if err != nil {
		return nil, nil, err
	}

	prop, err := i.addNewProperty(ctx, extension.Schema(), sceneID, &filter)
	if err != nil {
		return nil, nil, err
	}

	extended := false
	floating := false
	var specifiedLocation *plugin.WidgetLocation
	if widgetLayout := extension.WidgetLayout(); widgetLayout != nil {
		extended = widgetLayout.Extended()
		floating = widgetLayout.Floating()
		specifiedLocation = widgetLayout.DefaultLocation()
	}

	widget, err := scene.NewWidget(
		id.NewWidgetID(),
		*pluginID,
		*extensionID,
		prop.ID(),
		true,
		extended,
	)
	if err != nil {
		return nil, nil, err
	}

	var location *scene.WidgetLocation
	if !floating {
		if specifiedLocation != nil {
			location = &scene.WidgetLocation{
				Zone:    scene.WidgetZoneType(specifiedLocation.Zone),
				Section: scene.WidgetSectionType(specifiedLocation.Section),
				Area:    scene.WidgetAreaType(specifiedLocation.Area),
			}
		} else {
			location = &scene.WidgetLocation{
				Zone:    scene.WidgetZoneOuter,
				Section: scene.WidgetSectionLeft,
				Area:    scene.WidgetAreaTop,
			}
		}
	}

	return widget, location, nil
}

func (i *Scene) AddWidget(ctx context.Context, _type scene.WidgetAlignSystemType, sid id.SceneID, pid id.PluginID, eid id.PluginExtensionID, operator *usecase.Operator) (_ *scene.Scene, widget *scene.Widget, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, sid)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteWorkspace(s.Workspace(), operator); err != nil {
		return nil, nil, err
	}

	extension, err := i.getWidgePlugin(ctx, pid, eid, nil)
	if err != nil {
		return nil, nil, err
	}

	property, err := i.addNewProperty(ctx, extension.Schema(), sid, nil)
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

	s.Widgets().Add(widget)

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
		s.Widgets().Alignment().System(_type).Area(loc).Add(widget.ID(), -1)
	}

	err = i.sceneRepo.Save(ctx, s)
	if err != nil {
		return nil, nil, err
	}

	err = updateProjectUpdatedAtByID(ctx, s.Project(), i.projectRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return s, widget, nil
}

func (i *Scene) UpdateWidget(ctx context.Context, param interfaces.UpdateWidgetParam, operator *usecase.Operator) (_ *scene.Scene, _ *scene.Widget, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scene, err2 := i.sceneRepo.FindByID(ctx, param.SceneID)
	if err2 != nil {
		return nil, nil, err2
	}
	if err := i.CanWriteWorkspace(scene.Workspace(), operator); err != nil {
		return nil, nil, err
	}

	widget := scene.Widgets().Widget(param.WidgetID)
	if widget == nil {
		return nil, nil, rerror.ErrNotFound
	}
	_, location := scene.Widgets().Alignment().System(param.Type).Find(param.WidgetID)

	extension, err := i.getWidgePlugin(ctx, widget.Plugin(), widget.Extension(), nil)
	if err != nil {
		return nil, nil, err
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
		scene.Widgets().Alignment().System(param.Type).Move(widget.ID(), location, index)
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

	err = updateProjectUpdatedAtByID(ctx, scene.Project(), i.projectRepo)
	if err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return scene, widget, nil
}

func (i *Scene) UpdateWidgetAlignSystem(ctx context.Context, param interfaces.UpdateWidgetAlignSystemParam, operator *usecase.Operator) (_ *scene.Scene, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err2 := i.sceneRepo.FindByID(ctx, param.SceneID)
	if err2 != nil {
		return nil, err2
	}
	if err := i.CanWriteWorkspace(s.Workspace(), operator); err != nil {
		return nil, err
	}

	area := s.Widgets().Alignment().System(param.Type).Area(param.Location)

	if area == nil {
		return nil, errors.New("invalid location")
	}

	if param.Align != nil {
		area.SetAlignment(*param.Align)
	}

	if param.Padding != nil {
		area.SetPadding(param.Padding)
	}
	if param.Gap != nil {
		area.SetGap(param.Gap)
	}
	if param.Centered != nil {
		area.SetCentered(*param.Centered)
	}
	if param.Background != nil {
		area.SetBackground(param.Background)
	}

	if err = i.sceneRepo.Save(ctx, s); err != nil {
		return nil, err
	}

	err = updateProjectUpdatedAtByID(ctx, s.Project(), i.projectRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return s, nil
}

func (i *Scene) RemoveWidget(ctx context.Context, _type scene.WidgetAlignSystemType, id id.SceneID, wid id.WidgetID, operator *usecase.Operator) (_ *scene.Scene, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scene, err2 := i.sceneRepo.FindByID(ctx, id)
	if err2 != nil {
		return nil, err2
	}
	if err := i.CanWriteWorkspace(scene.Workspace(), operator); err != nil {
		return nil, err
	}

	ws := scene.Widgets()

	widget := ws.Widget(wid)
	if widget == nil {
		return nil, rerror.ErrNotFound
	}

	ws.Remove(wid)
	scene.Widgets().Alignment().System(_type).Remove(wid)

	err2 = i.propertyRepo.Remove(ctx, widget.Property())
	if err2 != nil {
		return nil, err2
	}

	err2 = i.sceneRepo.Save(ctx, scene)
	if err2 != nil {
		return nil, err2
	}

	err = updateProjectUpdatedAtByID(ctx, scene.Project(), i.projectRepo)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return scene, nil
}

func (i *Scene) ExportSceneData(ctx context.Context, prj *project.Project) (*scene.Scene, map[string]interface{}, error) {

	sce, err := i.sceneRepo.FindByProject(ctx, prj.ID())
	if err != nil {
		return nil, nil, errors.New("Fail scene :" + err.Error())
	}

	sceneID := sce.ID()
	nlsLayers, err := i.nlsLayerRepo.FindByScene(ctx, sceneID)
	if err != nil {
		return nil, nil, errors.New("Fail nlsLayer :" + err.Error())
	}
	layerStyles, err := i.layerStyles.FindByScene(ctx, sceneID)
	if err != nil {
		return nil, nil, errors.New("Fail layerStyles :" + err.Error())
	}
	storyList, err := i.storytellingRepo.FindByScene(ctx, sceneID)
	if err != nil {
		return nil, nil, errors.New("Fail storytelling :" + err.Error())
	}
	var story *storytelling.Story
	if storyList != nil && len(*storyList) > 0 {
		story = (*storyList)[0]
	}
	sceneJSON, err := builder.New(
		repo.PropertyLoaderFrom(i.propertyRepo),
		repo.NLSLayerLoaderFrom(i.nlsLayerRepo),
		true,
	).ForScene(sce).WithNLSLayers(&nlsLayers).WithLayerStyle(layerStyles).WithStory(story).BuildResult(
		ctx,
		time.Now(),
		prj.CoreSupport(),
		prj.EnableGA(),
		prj.TrackingID(),
	)
	if err != nil {
		return nil, nil, errors.New("Fail BuildResult :" + err.Error())
	}

	res := make(map[string]any)
	res["scene"] = sceneJSON

	return sce, res, nil
}

func Filter(s id.SceneID) repo.SceneFilter {
	return repo.SceneFilter{Readable: id.SceneIDList{s}, Writable: id.SceneIDList{s}}
}

func (i *Scene) ImportSceneData(ctx context.Context, sce *scene.Scene, data *[]byte) (*scene.Scene, error) {
	log.Infof("[ImportSceneData] workspace: %s project: %s scene: %s", sce.Workspace().String(), sce.Project().String(), sce.ID().String())

	sceneJSON, err := builder.ParseSceneJSONByByte(data)
	if err != nil {
		return nil, err
	}

	if sceneJSON.WidgetAlignSystems != nil {
		return nil, errors.New("[Import WidgetAlignSystem] this is old data that is not supported.")
	}

	filter := Filter(sce.ID())

	if p, err := i.propertyRepo.Filtered(filter).FindByID(ctx, sce.Property()); err == nil {
		builder.PropertyUpdate(ctx, p, i.propertyRepo, i.propertySchemaRepo, sceneJSON.Property)
		for k, v := range sceneJSON.Plugins {
			log.Errorf("[Import Error] Unsupported plugin: %s value: %v", k, v)
		}
	}

	for _, widgetJSON := range sceneJSON.Widgets {

		pluginID, extensionID, extension, err := i.getWidgePluginWithID(ctx, widgetJSON.PluginID, widgetJSON.ExtensionID, &filter)
		if err != nil {
			log.Errorf("[Import Error] closing file: %v", err)
			return nil, err
		}
		fmt.Println("[Import Widget] scene plugin id:", pluginID.String(), "extension:", extensionID.String(), "name:", extension.Name())

		// exclude official plugin
		if pluginID.String() != "reearth" {
			sce.AddPlugin(scene.NewPlugin(*pluginID, nil))
		}

		propW, err := i.addNewProperty(ctx, extension.Schema(), sce.ID(), &filter)
		if err != nil {
			log.Errorf("[Import Error] fail scene add property: %v", err)
			return nil, err
		}
		builder.PropertyUpdate(ctx, propW, i.propertyRepo, i.propertySchemaRepo, widgetJSON.Property)

		newWidgetID := id.NewWidgetID()

		// Replace new widget id
		*data = bytes.Replace(*data, []byte(widgetJSON.ID), []byte(newWidgetID.String()), -1)

		widget, err := scene.NewWidget(
			newWidgetID,
			*pluginID,
			*extensionID,
			propW.ID(),
			widgetJSON.Enabled,
			widgetJSON.Extended,
		)
		if err != nil {
			log.Errorf("[Import Error] fail scene build widget: %v", err)
			return nil, err
		}

		sce.Widgets().Add(widget)
	}

	alignSystem, err := builder.ParserWidgetAlignSystem(data)
	if err != nil {
		return nil, err
	}
	sce.Widgets().SetAlignment(alignSystem)

	sce.SetUpdatedAt(time.Now())

	if err := i.sceneRepo.Save(ctx, sce); err != nil {
		log.Errorf("[Import Error] fail scene update: %v", err)
		return nil, err
	}

	result, err := i.sceneRepo.FindByID(ctx, sce.ID())
	if err != nil {
		return nil, err
	}
	return result, nil
}

func injectExtensionsToScene(s *scene.Scene, ext []id.PluginID) {
	lo.ForEach(ext, func(p id.PluginID, _ int) {
		s.Plugins().Add(scene.NewPlugin(p, nil))
	})
}

func (i *Scene) getWidgePlugin(ctx context.Context, pid id.PluginID, eid id.PluginExtensionID, readableFilter *repo.SceneFilter) (*plugin.Extension, error) {
	var pr *plugin.Plugin
	var err error
	if readableFilter == nil {
		pr, err = i.pluginRepo.FindByID(ctx, pid)
	} else {
		pr, err = i.pluginRepo.Filtered(*readableFilter).FindByID(ctx, pid)
	}
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, ErrPluginNotFound
		}
		return nil, err
	}
	extension := pr.Extension(eid)
	if extension == nil {
		return nil, ErrExtensionNotFound
	}
	if extension.Type() != plugin.ExtensionTypeWidget {
		return nil, interfaces.ErrExtensionTypeMustBeWidget
	}
	return extension, nil
}

func (i *Scene) getWidgePluginWithID(ctx context.Context, pid string, eid string, readableFilter *repo.SceneFilter) (*id.PluginID, *id.PluginExtensionID, *plugin.Extension, error) {
	pluginID, err := id.PluginIDFrom(pid)
	if err != nil {
		return nil, nil, nil, err
	}
	extensionID := id.PluginExtensionID(eid)
	extension, err := i.getWidgePlugin(ctx, pluginID, extensionID, readableFilter)
	if err != nil {
		return nil, nil, nil, err
	}
	return &pluginID, &extensionID, extension, nil
}

func (i *Scene) addNewProperty(ctx context.Context, schemaID id.PropertySchemaID, sceneID id.SceneID, filter *repo.SceneFilter) (*property.Property, error) {
	prop, err := property.New().NewID().Schema(schemaID).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}
	if filter == nil {
		if err = i.propertyRepo.Save(ctx, prop); err != nil {
			return nil, err
		}
	} else {
		if err = i.propertyRepo.Filtered(*filter).Save(ctx, prop); err != nil {
			return nil, err
		}
	}
	return prop, nil
}
