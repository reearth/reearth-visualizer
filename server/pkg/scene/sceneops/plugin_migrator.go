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
	RemovedProperties property.IDList
}

var (
	ErrPluginNotInstalled = errors.New("plugin not installed")
	ErrInvalidPlugins     = errors.New("invalid plugins")
)

func (s *PluginMigrator) MigratePlugins(ctx context.Context, sc *scene.Scene, oldPluginID, newPluginID plugin.ID) (MigratePluginsResult, error) {
	if s == nil {
		return MigratePluginsResult{}, rerror.ErrInternalByWithContext(ctx, errors.New("scene is nil"))
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
	propertyIDs := property.IDList{}
	removedPropertyIDs := property.IDList{}

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

		if p := ll.Property(); p != nil {
			propertyIDs = append(propertyIDs, *p)
		}

		if ll.Infobox() == nil {
			continue
		}

		// Remove invalid Infobox Fields
		for _, f := range ll.Infobox().Fields() {
			if !f.Plugin().Equal(oldPlugin.ID()) {
				continue
			}

			modifiedLayers = modifiedLayers.AddUnique(l)
			if newPlugin.Extension(f.Extension()) == nil {
				ll.Infobox().Remove(f.ID())
				removedPropertyIDs = append(removedPropertyIDs, f.Property())
			} else {
				f.UpgradePlugin(newPluginID)
				propertyIDs = append(propertyIDs, f.Property())
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
		RemovedProperties: removedPropertyIDs,
	}, nil
}

func (s *PluginMigrator) loadSchemas(ctx context.Context, oldPlugin *plugin.Plugin, newPlugin *plugin.Plugin) (map[property.SchemaID]*property.Schema, error) {
	schemasIDs := newPlugin.PropertySchemas().MergeUnique(oldPlugin.PropertySchemas())
	schemas, err := s.PropertySchema(ctx, schemasIDs...)
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

func collectDatasetIDs(properties []*property.Property) []property.DatasetID {
	res := []property.DatasetID{}
	for _, p := range properties {
		res = append(res, p.Datasets()...)
	}
	return res
}
