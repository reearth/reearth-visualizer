package interactor

import (
	"archive/zip"
	"context"
	"errors"
	"net/url"
	"time"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/scene/builder"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Scene struct {
	common
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

func (i *Scene) Create(ctx context.Context, pid id.ProjectID, operator *usecase.Operator) (_ *scene.Scene, err error) {
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

	viz := visualizer.VisualizerCesium
	if prj.CoreSupport() {
		viz = visualizer.VisualizerCesiumBeta
	}
	schema := builtin.GetPropertySchemaByVisualizer(viz)

	sceneID := id.NewSceneID()
	ps := scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})

	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}

	addDefaultTiles(prop, schema)

	res, err := scene.New().
		ID(sceneID).
		Project(pid).
		Workspace(ws).
		Property(prop.ID()).
		Plugins(ps).
		Build()
	if err != nil {
		return nil, err
	}

	writableFilter := repo.SceneFilter{Writable: scene.IDList{res.ID()}}
	if err := i.propertyRepo.Filtered(writableFilter).Save(ctx, prop); err != nil {
		return nil, err
	}

	if err = i.addDefaultExtensionWidget(ctx, sceneID, res); err != nil {
		return nil, err
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

func addDefaultTiles(prop *property.Property, schema *property.Schema) {
	tiles := id.PropertySchemaGroupID("tiles")
	g := prop.GetOrCreateGroupList(schema, property.PointItemBySchema(tiles))
	g.Add(property.NewGroup().NewID().SchemaGroup(tiles).MustBuild(), -1)
}

func saveSceneComponents(ctx context.Context, i *Scene, sceneID id.SceneID, rootLayer *layer.Group, prop *property.Property) error {
	if err := i.propertyRepo.Filtered(repo.SceneFilter{Writable: id.SceneIDList{sceneID}}).Save(ctx, prop); err != nil {
		return err
	}
	return i.layerRepo.Filtered(repo.SceneFilter{Writable: id.SceneIDList{sceneID}}).Save(ctx, rootLayer)
}

func (i *Scene) addDefaultExtensionWidget(ctx context.Context, sceneID id.SceneID, res *scene.Scene) error {
	eid := id.PluginExtensionID("dataAttribution")
	pluginID, err := id.PluginIDFrom("reearth")
	if err != nil {
		return err
	}
	extension, err := i.getWidgePlugin(ctx, pluginID, eid, nil)
	if err != nil {
		return err
	}

	prop, err := property.New().NewID().Schema(extension.Schema()).Scene(sceneID).Build()
	if err != nil {
		return err
	}

	extended := false
	floating := false
	var location *plugin.WidgetLocation
	if widgetLayout := extension.WidgetLayout(); widgetLayout != nil {
		extended = widgetLayout.Extended()
		floating = widgetLayout.Floating()
		location = widgetLayout.DefaultLocation()
	}

	widget, err := scene.NewWidget(
		id.NewWidgetID(),
		pluginID,
		eid,
		prop.ID(),
		true,
		extended,
	)
	if err != nil {
		return err
	}

	res.Widgets().Add(widget)
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
		res.Widgets().Alignment().Area(loc).Add(widget.ID(), -1)
	}

	if err := i.propertyRepo.Filtered(repo.SceneFilter{Writable: id.SceneIDList{sceneID}}).Save(ctx, prop); err != nil {
		return err
	}

	return nil
}

func (i *Scene) AddWidget(ctx context.Context, sid id.SceneID, pid id.PluginID, eid id.PluginExtensionID, operator *usecase.Operator) (_ *scene.Scene, widget *scene.Widget, err error) {
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
		s.Widgets().Alignment().Area(loc).Add(widget.ID(), -1)
	}

	err = i.propertyRepo.Save(ctx, property)
	if err != nil {
		return nil, nil, err
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
	_, location := scene.Widgets().Alignment().Find(param.WidgetID)

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
		scene.Widgets().Alignment().Move(widget.ID(), location, index)
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

	area := s.Widgets().Alignment().Area(param.Location)

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

func (i *Scene) RemoveWidget(ctx context.Context, id id.SceneID, wid id.WidgetID, operator *usecase.Operator) (_ *scene.Scene, err error) {
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
	scene.Widgets().Alignment().Remove(wid)

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

func (i *Scene) ExportScene(ctx context.Context, prj *project.Project, zipWriter *zip.Writer) (*scene.Scene, map[string]interface{}, error) {

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

	// nlsLayer file resources
	for _, nLayer := range nlsLayers {
		actualLayer := *nLayer
		c := actualLayer.Config()
		if c != nil {
			actualConfig := *c
			if data, ok := actualConfig["data"].(map[string]any); ok {
				if urlStr, ok := data["url"].(string); ok {
					u, _ := url.Parse(urlStr)
					if err := AddZipAsset(ctx, i.file, zipWriter, u.Path); err != nil {
						log.Infofc(ctx, "Fail nLayer addZipAsset :", err.Error())
					}
				}
			}
		}
	}

	var widgetPropertyIDs []idx.ID[id.Property]
	for _, widget := range sce.Widgets().Widgets() {
		widgetPropertyIDs = append(widgetPropertyIDs, widget.Property())
	}
	widgetProperties, err := i.propertyRepo.FindByIDs(ctx, widgetPropertyIDs)
	if err != nil {
		return nil, nil, errors.New("Fail widgetProperties :" + err.Error())
	}

	// widget button icon
	for _, property := range widgetProperties {
		for _, item := range property.Items() {
			if item == nil {
				continue
			}
			for _, field := range item.Fields(nil) {
				if field == nil || field.Value() == nil || field.Value().Value() == nil {
					continue
				}
				if field.GuessSchema().ID().String() == "buttonIcon" {
					if u, ok := field.Value().Value().(*url.URL); ok {
						if err := AddZipAsset(ctx, i.file, zipWriter, u.Path); err != nil {
							log.Infofc(ctx, "Fail widget addZipAsset :", err.Error())
						}
					}
				}
			}
		}
	}

	var pagePropertyIDs []idx.ID[id.Property]
	for _, page := range story.Pages().Pages() {
		for _, block := range page.Blocks() {
			pagePropertyIDs = append(pagePropertyIDs, block.Property())
		}
	}
	pageProperties, err := i.propertyRepo.FindByIDs(ctx, pagePropertyIDs)
	if err != nil {
		return nil, nil, errors.New("Fail property :" + err.Error())
	}
	// page block src
	for _, property := range pageProperties {
		for _, item := range property.Items() {
			for _, field := range item.Fields(nil) {
				if field.GuessSchema().ID().String() == "src" {
					if u, ok := field.Value().Value().(*url.URL); ok {
						if err := AddZipAsset(ctx, i.file, zipWriter, u.Path); err != nil {
							log.Infofc(ctx, "Fail widget addZipAsset :", err.Error())
						}
					}
				}
			}
		}
	}

	res := make(map[string]interface{})
	res["scene"] = sceneJSON

	return sce, res, nil
}

func (i *Scene) ImportScene(ctx context.Context, sce *scene.Scene, prj *project.Project, plgs []*plugin.Plugin, sceneData map[string]interface{}) (*scene.Scene, error) {
	sceneJSON, err := builder.ParseSceneJSON(ctx, sceneData)
	if err != nil {
		return nil, err
	}

	readableFilter := repo.SceneFilter{Readable: id.SceneIDList{sce.ID()}}
	writableFilter := repo.SceneFilter{Writable: id.SceneIDList{sce.ID()}}

	widgets := []*scene.Widget{}
	replaceWidgetIDs := make(map[string]idx.ID[id.Widget])
	for _, widgetJSON := range sceneJSON.Widgets {
		pluginID, err := id.PluginIDFrom(widgetJSON.PluginID)
		if err != nil {
			return nil, err
		}
		extensionID := id.PluginExtensionID(widgetJSON.ExtensionID)
		extension, err := i.getWidgePlugin(ctx, pluginID, extensionID, &readableFilter)
		if err != nil {
			return nil, err
		}
		prop, err := property.New().NewID().Schema(extension.Schema()).Scene(sce.ID()).Build()
		if err != nil {
			return nil, err
		}
		ps, err := i.propertySchemaRepo.Filtered(readableFilter).FindByID(ctx, extension.Schema())
		if err != nil {
			return nil, err
		}
		prop, err = builder.AddItemFromPropertyJSON(ctx, prop, ps, widgetJSON.Property)
		if err != nil {
			return nil, err
		}
		// Save property
		if err = i.propertyRepo.Filtered(writableFilter).Save(ctx, prop); err != nil {
			return nil, err
		}

		newWidgetID := id.NewWidgetID()
		replaceWidgetIDs[widgetJSON.ID] = newWidgetID
		widget, err := scene.NewWidget(newWidgetID, pluginID, extensionID, prop.ID(), widgetJSON.Enabled, widgetJSON.Extended)
		if err != nil {
			return nil, err
		}
		widgets = append(widgets, widget)
	}

	var viz = visualizer.VisualizerCesium
	if prj.CoreSupport() {
		viz = visualizer.VisualizerCesiumBeta
	}
	schema := builtin.GetPropertySchemaByVisualizer(viz)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sce.ID()).Build()
	if err != nil {
		return nil, err
	}
	prop, err = builder.AddItemFromPropertyJSON(ctx, prop, schema, sceneJSON.Property)
	if err != nil {
		return nil, err
	}
	// Save property
	if err = i.propertyRepo.Filtered(writableFilter).Save(ctx, prop); err != nil {
		return nil, err
	}

	plugins := sce.Plugins()
	for _, plg := range plgs {
		if plg.ID().String() != "reearth" {
			plugins.Add(scene.NewPlugin(plg.ID(), nil))
		}
	}

	alignSystem := builder.ParserWidgetAlignSystem(sceneJSON.WidgetAlignSystem, replaceWidgetIDs)
	s2, err := scene.New().
		ID(sce.ID()).
		Project(prj.ID()).
		Workspace(prj.Workspace()).
		Widgets(scene.NewWidgets(widgets, alignSystem)).
		UpdatedAt(time.Now()).
		Property(prop.ID()).
		Plugins(plugins).
		Build()
	if err != nil {
		return nil, err
	}

	// Save scene (update)
	if err := i.sceneRepo.Save(ctx, s2); err != nil {
		return nil, err
	}
	if err := updateProjectUpdatedAt(ctx, prj, i.projectRepo); err != nil {
		return nil, err
	}
	s3, err := i.sceneRepo.FindByID(ctx, sce.ID())
	if err != nil {
		return nil, err
	}
	return s3, nil
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
