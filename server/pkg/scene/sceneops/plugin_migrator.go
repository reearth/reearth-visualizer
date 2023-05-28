package sceneops

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

type PluginMigrator struct {
	Property       property.Loader
	PropertySchema property.SchemaLoader
	Dataset        dataset.Loader
	Layer          layer.LoaderByScene
	Plugin         plugin.Loader
}

type MigratePluginsResult struct {
	Scene             *scene.Scene
	Layers            layer.List
	Properties        []*property.Property
	RemovedLayers     []layer.ID
	RemovedProperties []property.ID
}

var (
	ErrPluginNotInstalled = errors.New("plugin not installed")
	ErrInvalidPlugins     = errors.New("invalid plugins")
)

func (s *PluginMigrator) MigratePlugins(ctx context.Context, sc *scene.Scene, oldPluginID, newPluginID plugin.ID) (MigratePluginsResult, error) {
	if s == nil {
		return MigratePluginsResult{}, rerror.ErrInternalBy(errors.New("scene is nil"))
	}

	// should be same plugin but different version
	if oldPluginID.Equal(newPluginID) || !oldPluginID.NameEqual(newPluginID) {
		return MigratePluginsResult{}, ErrInvalidPlugins
	}

	// should be installed
	if !sc.Plugins().Has(oldPluginID) {
		return MigratePluginsResult{}, ErrPluginNotInstalled
	}

	// Get plugins
	plugins, err := s.Plugin(ctx, []plugin.ID{oldPluginID, newPluginID})
	if err != nil || len(plugins) < 2 {
		return MigratePluginsResult{}, ErrInvalidPlugins
	}

	oldPlugin := plugins[0]
	newPlugin := plugins[1]

	// Get all layers
	layers, err := s.Layer(ctx, sc.ID())
	if err != nil {
		return MigratePluginsResult{}, err
	}

	modifiedLayers := layer.List{}
	removedLayers := layer.IDList{}
	propertyIDs := []property.ID{}
	removedPropertyIDs := []property.ID{}

	// Obtain property schema and map old schema to new schema
	schemaMap, err := s.loadSchemas(ctx, oldPlugin, newPlugin)
	if err != nil {
		return MigratePluginsResult{}, err
	}

	// Scene Plug-ins
	sc.Plugins().Upgrade(oldPluginID, newPluginID, nil, false)
	for _, sp := range sc.Plugins().Plugins() {
		if sp.Plugin().Equal(newPluginID) && sp.Property() != nil {
			propertyIDs = append(propertyIDs, *sp.Property())
		}
	}

	// Scene widgets
	sc.Widgets().UpgradePlugin(oldPluginID, newPluginID)
	for _, w := range sc.Widgets().Widgets() {
		if w.Plugin().Equal(newPluginID) {
			if newPlugin.Extension(w.Extension()) == nil {
				sc.Widgets().RemoveAllByPlugin(oldPluginID, w.Extension().Ref())
			} else {
				propertyIDs = append(propertyIDs, w.Property())
			}
		}
	}

	// layers
	for _, l := range layers {
		if l == nil {
			continue
		}
		ll := *l
		llp, lle := ll.Plugin(), ll.Extension()

		// Detect invalid layers
		if isInvalidLayer(llp, lle, oldPlugin, newPlugin) {
			removedLayers.AppendLayers(ll.ID())
			removedPropertyIDs = append(removedPropertyIDs, collectLayerPropertyIds(ll)...)
			continue
		}

		if p := ll.Property(); p != nil {
			propertyIDs = append(propertyIDs, *p)
		}

		if ll.Infobox() == nil {
			continue
		}

		// Remove invalid Infobox Fields
		modified := false
		for _, f := range ll.Infobox().Fields() {
			if f.Plugin() != oldPlugin.ID() {
				continue
			}
			modified = true
			if newPlugin.Extension(f.Extension()) == nil {
				ll.Infobox().Remove(f.ID())
				removedPropertyIDs = append(removedPropertyIDs, f.Property())
			} else {
				propertyIDs = append(propertyIDs, f.Property())
			}
		}

		if modified {
			modifiedLayers = append(modifiedLayers, l)
		}
	}

	// Remove invalid layers group inside layer group
	for _, lg := range layers.ToLayerGroupList() {
		if removedLayers.HasLayer(lg.ID()) {
			continue
		}
		if lg.Layers().RemoveLayer(removedLayers.Layers()...) > 0 {
			if modifiedLayers.Find(lg.ID()) != nil {
				modifiedLayers = append(modifiedLayers, lo.ToPtr(layer.Layer(lg)))
			}
		}
	}

	// Get all Properties
	properties, err := s.Property(ctx, propertyIDs...)
	if err != nil {
		return MigratePluginsResult{}, err
	}

	// Get all Datasets
	datasetIDs := collectDatasetIDs(properties)
	datasets, err := s.Dataset(ctx, datasetIDs...)
	if err != nil {
		return MigratePluginsResult{}, err
	}
	datasetLoader := datasets.Map().Loader()

	// Migrate Properties
	for _, p := range properties {
		if schema := schemaMap[p.Schema()]; schema != nil {
			p.MigrateSchema(ctx, schema, datasetLoader)
		}
	}

	return MigratePluginsResult{
		Scene:             sc,
		Layers:            modifiedLayers,
		Properties:        properties,
		RemovedLayers:     removedLayers.Layers(),
		RemovedProperties: removedPropertyIDs,
	}, nil
}

func isInvalidLayer(llp *layer.PluginID, lle *layer.PluginExtensionID, oldPlugin, newPlugin *plugin.Plugin) bool {
	// a layer considered invalid if it is related to the old plugin
	// and if the new plugin version does not support the extension
	return llp != nil && lle != nil && (*llp).Equal(oldPlugin.ID()) && newPlugin.Extension(*lle) == nil
}

func collectLayerPropertyIds(ll layer.Layer) []property.ID {
	removedPropertyIDs := []property.ID{}
	if p := ll.Property(); p != nil {
		removedPropertyIDs = append(removedPropertyIDs, *p)
	}
	if ib := ll.Infobox(); ib != nil {
		removedPropertyIDs = append(removedPropertyIDs, ib.Property())
		for _, f := range ib.Fields() {
			removedPropertyIDs = append(removedPropertyIDs, f.Property())
		}
	}
	return removedPropertyIDs
}

func (s *PluginMigrator) loadSchemas(ctx context.Context, oldPlugin *plugin.Plugin, newPlugin *plugin.Plugin) (map[property.SchemaID]*property.Schema, error) {
	schemaIDs := collectSchemaIds(oldPlugin, newPlugin)
	schemas, err := s.PropertySchema(ctx, schemaIDs...)
	if err != nil {
		return nil, err
	}
	schemaMap := map[property.SchemaID]*property.Schema{}
	if opsId := oldPlugin.Schema(); opsId != nil {
		if npsId := newPlugin.Schema(); npsId != nil {
			for _, s := range schemas {
				if s.ID() == *npsId {
					schemaMap[*opsId] = s
				}
			}
		}
	}
	for _, e := range oldPlugin.Extensions() {
		if npe := newPlugin.Extension(e.ID()); npe != nil {
			for _, s := range schemas {
				if s.ID() == npe.Schema() {
					schemaMap[e.Schema()] = s
				}
			}
		}
	}
	return schemaMap, nil
}

func collectSchemaIds(oldPlugin *plugin.Plugin, newPlugin *plugin.Plugin) []property.SchemaID {
	schemaIDs := []property.SchemaID{}
	if oldPlugin.Schema() != nil {
		if npsId := newPlugin.Schema(); npsId != nil {
			schemaIDs = append(schemaIDs, *npsId)
		}
	}
	for _, e := range newPlugin.Extensions() {
		schemaIDs = append(schemaIDs, e.Schema())
	}
	return schemaIDs
}

func collectDatasetIDs(properties []*property.Property) []property.DatasetID {
	res := []property.DatasetID{}
	for _, p := range properties {
		res = append(res, p.Datasets()...)
	}
	return res
}
