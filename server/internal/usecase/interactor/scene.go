package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/visualizer"
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
	layerRepo          repo.Layer
	datasetRepo        repo.Dataset
	transaction        usecasex.Transaction
	file               gateway.File
	pluginRegistry     gateway.PluginRegistry
	extensions         []plugin.ID
}

func NewScene(r *repo.Container, g *gateway.Container) interfaces.Scene {
	return &Scene{
		sceneRepo:          r.Scene,
		propertyRepo:       r.Property,
		propertySchemaRepo: r.PropertySchema,
		projectRepo:        r.Project,
		pluginRepo:         r.Plugin,
		layerRepo:          r.Layer,
		datasetRepo:        r.Dataset,
		transaction:        r.Transaction,
		file:               g.File,
		pluginRegistry:     g.PluginRegistry,
		extensions:         r.Extensions,
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

	var viz = visualizer.VisualizerCesium

	if prj.CoreSupport() {
		viz = visualizer.VisualizerCesiumBeta
	}

	schema := builtin.GetPropertySchemaByVisualizer(viz)
	sceneID := id.NewSceneID()

	rootLayer, err := layer.NewGroup().NewID().Scene(sceneID).Root(true).Build()
	if err != nil {
		return nil, err
	}

	ps := scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})

	p, err := property.New().NewID().Schema(schema.ID()).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}

	// add default tile
	tiles := id.PropertySchemaGroupID("tiles")
	g := p.GetOrCreateGroupList(schema, property.PointItemBySchema(tiles))
	g.Add(property.NewGroup().NewID().SchemaGroup(tiles).MustBuild(), -1)

	res, err := scene.New().
		ID(sceneID).
		Project(pid).
		Workspace(prj.Workspace()).
		Property(p.ID()).
		Plugins(ps).
		Build()

	if err != nil {
		return nil, err
	}

	if p != nil {
		err = i.propertyRepo.Filtered(repo.SceneFilter{Writable: scene.IDList{sceneID}}).Save(ctx, p)
		if err != nil {
			return nil, err
		}
	}

	err = i.layerRepo.Filtered(repo.SceneFilter{Writable: scene.IDList{sceneID}}).Save(ctx, rootLayer)
	if err != nil {
		return nil, err
	}

	err = i.sceneRepo.Save(ctx, res)
	if err != nil {
		return nil, err
	}

	operator.AddNewScene(ws, sceneID)
	tx.Commit()
	return res, err
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

	pr, err := i.pluginRepo.FindByID(ctx, pid)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, interfaces.ErrPluginNotFound
		}
		return nil, nil, err
	}

	extension := pr.Extension(eid)
	if extension == nil {
		return nil, nil, interfaces.ErrExtensionNotFound
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

	pr, err := i.pluginRepo.FindByID(ctx, widget.Plugin())
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, interfaces.ErrPluginNotFound
		}
		return nil, nil, err
	}

	extension := pr.Extension(widget.Extension())
	if extension == nil {
		return nil, nil, interfaces.ErrExtensionNotFound
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

	tx.Commit()
	return scene, nil
}

func (i *Scene) AddCluster(ctx context.Context, sceneID id.SceneID, name string, operator *usecase.Operator) (*scene.Scene, *scene.Cluster, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, sceneID)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteWorkspace(s.Workspace(), operator); err != nil {
		return nil, nil, err
	}

	prop, err := property.New().NewID().Schema(id.MustPropertySchemaID("reearth/cluster")).Scene(sceneID).Build()
	if err != nil {
		return nil, nil, err
	}

	cid := id.NewClusterID()
	cluster, err := scene.NewCluster(cid, name, prop.ID())
	if err != nil {
		return nil, nil, err
	}
	s.Clusters().Add(cluster)

	err = i.propertyRepo.Save(ctx, prop)
	if err != nil {
		return nil, nil, err
	}

	if err := i.sceneRepo.Save(ctx, s); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return s, cluster, nil
}

func (i *Scene) UpdateCluster(ctx context.Context, param interfaces.UpdateClusterParam, operator *usecase.Operator) (*scene.Scene, *scene.Cluster, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, param.SceneID)
	if err != nil {
		return nil, nil, err
	}
	if err := i.CanWriteWorkspace(s.Workspace(), operator); err != nil {
		return nil, nil, err
	}

	cluster := s.Clusters().Get(param.ClusterID)
	if cluster == nil {
		return nil, nil, rerror.ErrNotFound
	}
	if param.Name != nil {
		cluster.Rename(*param.Name)
	}
	if param.PropertyID != nil {
		cluster.UpdateProperty(*param.PropertyID)
	}

	if err := i.sceneRepo.Save(ctx, s); err != nil {
		return nil, nil, err
	}

	tx.Commit()
	return s, cluster, nil
}

func (i *Scene) RemoveCluster(ctx context.Context, sceneID id.SceneID, clusterID id.ClusterID, operator *usecase.Operator) (*scene.Scene, error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return nil, err
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	s, err := i.sceneRepo.FindByID(ctx, sceneID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteWorkspace(s.Workspace(), operator); err != nil {
		return nil, err
	}

	s.Clusters().Remove(clusterID)

	if err := i.sceneRepo.Save(ctx, s); err != nil {
		return nil, err
	}

	tx.Commit()
	return s, nil
}

func injectExtensionsToScene(s *scene.Scene, ext []plugin.ID) {
	lo.ForEach(ext, func(p plugin.ID, _ int) {
		s.Plugins().Add(scene.NewPlugin(p, nil))
	})
}
