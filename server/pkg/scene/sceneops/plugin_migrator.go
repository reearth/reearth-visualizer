package sceneops

import (
	"context"
	"errors"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/rerror"
)

type PluginMigrator struct {
	Property       property.Loader
	PropertySchema property.SchemaLoader
	Plugin         plugin.Loader
}

type MigratePluginsResult struct {
	Scene             *scene.Scene
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

	// Get all Properties
	properties, err := s.Property(ctx, propertyIDs...)
	if err != nil {
		return MigratePluginsResult{}, err
	}

	// Migrate Properties
	for _, p := range properties {
		if schema := schemaMap[p.Schema()]; schema != nil {
			p.MigrateSchema(ctx, schema)
		}
	}

	return MigratePluginsResult{
		Scene:             sc,
		Properties:        properties,
		RemovedProperties: removedPropertyIDs,
	}, nil
}

func (s *PluginMigrator) loadSchemas(ctx context.Context, oldPlugin *plugin.Plugin, newPlugin *plugin.Plugin) (map[id.PropertySchemaID]*property.Schema, error) {
	schemasIDs := newPlugin.PropertySchemas().MergeUnique(oldPlugin.PropertySchemas())
	schemas, err := s.PropertySchema(ctx, schemasIDs...)
	if err != nil {
		return nil, err
	}
	schemaMap := map[id.PropertySchemaID]*property.Schema{}
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
