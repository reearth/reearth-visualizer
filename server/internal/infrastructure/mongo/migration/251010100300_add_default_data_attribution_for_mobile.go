package migration

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
)

type DataAttribution struct {
	sceneRepo    repo.Scene
	propertyRepo repo.Property
	pluginRepo   repo.Plugin
}

func NewDataAttribution(c DBClient) *DataAttribution {
	return &DataAttribution{
		sceneRepo:    mongo.NewScene(c),
		propertyRepo: mongo.NewProperty(c),
		pluginRepo:   mongo.NewPlugin(c),
	}
}

func AddDefaultDataAttributionForMobile(ctx context.Context, c DBClient) error {
	migration := NewDataAttribution(c)
	return migration.Do(ctx, c)
}

func (m *DataAttribution) Do(ctx context.Context, c DBClient) error {
	filter := bson.M{
		"alignsystems": bson.M{"$exists": true},
	}
	collection := c.WithCollection("scene").Client()

	cur, err := collection.Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			continue
		}
		idStr, ok := doc["id"].(string)
		if !ok {
			continue
		}

		sceID, err := id.SceneIDFrom(idStr)
		if err != nil {
			continue
		}

		sce, err := m.sceneRepo.FindByID(ctx, sceID)
		if err != nil {
			continue
		}

		widget, location, err := m.buildDataAttribution(ctx, sceID)
		if err != nil {
			log.Printf("migration: failed to build data attribution for scene %s: %v", sceID.String(), err)
			continue
		}
		// Type Mobile Attribution
		sce.Widgets().Add(widget)

		if location != nil {
			// Type Mobile Location
			sce.Widgets().Alignment().System(scene.WidgetAlignSystemTypeMobile).Area(*location).Add(widget.ID(), -1)
		}

		if err = m.sceneRepo.Save(ctx, sce); err != nil {
			continue
		}
	}

	return cur.Err()
}

func Filter(s id.SceneID) repo.SceneFilter {
	return repo.SceneFilter{Readable: id.SceneIDList{s}, Writable: id.SceneIDList{s}}
}

func (m *DataAttribution) getWidgePlugin(ctx context.Context, pid id.PluginID, eid id.PluginExtensionID, readableFilter *repo.SceneFilter) (*plugin.Extension, error) {
	var pr *plugin.Plugin
	var err error
	if readableFilter == nil {
		pr, err = m.pluginRepo.FindByID(ctx, pid)
	} else {
		pr, err = m.pluginRepo.Filtered(*readableFilter).FindByID(ctx, pid)
	}
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, interactor.ErrPluginNotFound
		}
		return nil, err
	}
	extension := pr.Extension(eid)
	if extension == nil {
		return nil, interactor.ErrExtensionNotFound
	}
	if extension.Type() != plugin.ExtensionTypeWidget {
		return nil, interfaces.ErrExtensionTypeMustBeWidget
	}
	return extension, nil
}

func (m *DataAttribution) addNewProperty(ctx context.Context, schemaID id.PropertySchemaID, sceneID id.SceneID, filter *repo.SceneFilter) (*property.Property, error) {
	prop, err := property.New().NewID().Schema(schemaID).Scene(sceneID).Build()
	if err != nil {
		return nil, err
	}
	if filter == nil {
		if err = m.propertyRepo.Save(ctx, prop); err != nil {
			return nil, err
		}
	} else {
		if err = m.propertyRepo.Filtered(*filter).Save(ctx, prop); err != nil {
			return nil, err
		}
	}
	return prop, nil
}

func (m *DataAttribution) getWidgePluginWithID(ctx context.Context, pid string, eid string, readableFilter *repo.SceneFilter) (*id.PluginID, *id.PluginExtensionID, *plugin.Extension, error) {
	pluginID, err := id.PluginIDFrom(pid)
	if err != nil {
		return nil, nil, nil, err
	}
	extensionID := id.PluginExtensionID(eid)
	extension, err := m.getWidgePlugin(ctx, pluginID, extensionID, readableFilter)
	if err != nil {
		return nil, nil, nil, err
	}
	return &pluginID, &extensionID, extension, nil
}

func (m *DataAttribution) buildDataAttribution(ctx context.Context, sceneID id.SceneID) (*scene.Widget, *scene.WidgetLocation, error) {
	filter := Filter(sceneID)

	pluginID, extensionID, extension, err := m.getWidgePluginWithID(ctx, "reearth", "dataAttribution", &filter)
	if err != nil {
		return nil, nil, err
	}

	prop, err := m.addNewProperty(ctx, extension.Schema(), sceneID, &filter)
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

func GetWidgePlugin(ctx context.Context, c DBClient, pid id.PluginID, eid id.PluginExtensionID, readableFilter *repo.SceneFilter) (*plugin.Extension, error) {
	migration := NewDataAttribution(c)
	return migration.getWidgePlugin(ctx, pid, eid, readableFilter)
}

func AddNewProperty(ctx context.Context, c DBClient, schemaID id.PropertySchemaID, sceneID id.SceneID, filter *repo.SceneFilter) (*property.Property, error) {
	migration := NewDataAttribution(c)
	return migration.addNewProperty(ctx, schemaID, sceneID, filter)
}

func GetWidgePluginWithID(ctx context.Context, c DBClient, pid string, eid string, readableFilter *repo.SceneFilter) (*id.PluginID, *id.PluginExtensionID, *plugin.Extension, error) {
	migration := NewDataAttribution(c)
	return migration.getWidgePluginWithID(ctx, pid, eid, readableFilter)
}

func BuildDataAttribution(ctx context.Context, c DBClient, sceneID id.SceneID) (*scene.Widget, *scene.WidgetLocation, error) {
	migration := NewDataAttribution(c)
	return migration.buildDataAttribution(ctx, sceneID)
}
