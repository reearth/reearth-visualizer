package sceneops

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
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
	ErrPluginNotInstalled error = errors.New("plugin not installed")
	ErrInvalidPlugins     error = errors.New("invalid plugins")
)

func (s *PluginMigrator) MigratePlugins(ctx context.Context, sc *scene.Scene, oldPluginID, newPluginID plugin.ID) (MigratePluginsResult, error) {
	if s == nil {
		return MigratePluginsResult{}, rerror.ErrInternalBy(errors.New("scene is nil"))
	}

	if oldPluginID.Equal(newPluginID) || !oldPluginID.NameEqual(newPluginID) {
		return MigratePluginsResult{}, ErrInvalidPlugins
	}

	if !sc.Plugins().Has(oldPluginID) {
		return MigratePluginsResult{}, ErrPluginNotInstalled
	}

	plugins, err := s.Plugin(ctx, []plugin.ID{oldPluginID, newPluginID})
	if err != nil || len(plugins) < 2 {
		return MigratePluginsResult{}, ErrInvalidPlugins
	}

	oldPlugin := plugins[0]
	newPlugin := plugins[1]

	// 全レイヤーの取得
	layers, err := s.Layer(ctx, sc.ID())
	if err != nil {
		return MigratePluginsResult{}, err
	}

	modifiedLayers := layer.List{}
	removedLayers := []layer.ID{}
	propertyIDs := []property.ID{}
	removedPropertyIDs := []property.ID{}
	schemaMap := map[property.SchemaID]*property.Schema{}

	// プロパティスキーマの取得と、古いスキーマと新しいスキーマのマップ作成
	schemaIDs := []property.SchemaID{}
	if oldPlugin.Schema() != nil {
		if pps := newPlugin.Schema(); pps != nil {
			schemaIDs = append(schemaIDs, *pps)
		}
	}
	for _, e := range newPlugin.Extensions() {
		schemaIDs = append(schemaIDs, e.Schema())
	}
	schemas, err := s.PropertySchema(ctx, schemaIDs...)
	if err != nil {
		return MigratePluginsResult{}, err
	}
	if oops := oldPlugin.Schema(); oops != nil {
		if pps := newPlugin.Schema(); pps != nil {
			for _, s := range schemas {
				if s.ID() == *pps {
					schemaMap[*oops] = s
				}
			}
		}
	}
	for _, e := range oldPlugin.Extensions() {
		if ne := newPlugin.Extension(e.ID()); ne != nil {
			for _, s := range schemas {
				if s.ID() == ne.Schema() {
					schemaMap[e.Schema()] = s
				}
			}
		}
	}

	// シーンのプラグイン
	sc.Plugins().Upgrade(oldPluginID, newPluginID, nil, false)
	for _, sp := range sc.Plugins().Plugins() {
		if sp.Plugin().Equal(newPluginID) && sp.Property() != nil {
			propertyIDs = append(propertyIDs, *sp.Property())
		}
	}

	// シーンのウィジェット
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

	// レイヤー
	for _, l := range layers {
		if l == nil {
			continue
		}
		ll := *l
		llp := ll.Plugin()
		lle := ll.Extension()

		// 不正なレイヤーの検出
		if llp != nil && lle != nil && (*llp).Equal(oldPluginID) {
			if newPlugin.Extension(*lle) == nil {
				// 削除
				removedLayers = append(removedLayers, ll.ID())
				if p := ll.Property(); p != nil {
					removedPropertyIDs = append(removedPropertyIDs, *p)
				}
				if ib := ll.Infobox(); ib != nil {
					removedPropertyIDs = append(removedPropertyIDs, ib.Property())
					for _, f := range ib.Fields() {
						removedPropertyIDs = append(removedPropertyIDs, f.Property())
					}
				}
				continue
			}
		}

		if p := ll.Property(); p != nil {
			propertyIDs = append(propertyIDs, *p)
		}

		// 不正なInfoboxFieldの削除
		if ib := ll.Infobox(); ib != nil {
			removeFields := []layer.InfoboxFieldID{}
			for _, f := range ib.Fields() {
				if newPlugin.Extension(f.Extension()) == nil {
					removeFields = append(removeFields, f.ID())
					removedPropertyIDs = append(removedPropertyIDs, f.Property())
				} else {
					propertyIDs = append(propertyIDs, f.Property())
				}
			}
			for _, f := range removeFields {
				ib.Remove(f)
			}
		}

		ll.SetPlugin(&newPluginID)
		modifiedLayers = append(modifiedLayers, l)
	}

	// 不正なレイヤーのグループからの削除
	for _, lg := range layers.ToLayerGroupList() {
		modified := false
		canceled := false
		for _, l := range removedLayers {
			if l == lg.ID() {
				canceled = true
				break
			}
			if lg.Layers().HasLayer(l) {
				lg.Layers().RemoveLayer(l)
				modified = true
			}
		}
		if canceled {
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

	// プロパティの取得
	properties, err := s.Property(ctx, propertyIDs...)
	if err != nil {
		return MigratePluginsResult{}, err
	}

	// データセットの取得
	datasetIDs := collectDatasetIDs(properties)
	datasets, err := s.Dataset(ctx, datasetIDs...)
	if err != nil {
		return MigratePluginsResult{}, err
	}
	datasetLoader := datasets.Map().Loader()

	// プロパティの移行作業
	for _, p := range properties {
		if schema := schemaMap[p.Schema()]; schema != nil {
			p.MigrateSchema(ctx, schema, datasetLoader)
		}
	}

	return MigratePluginsResult{
		Scene:             sc,
		Layers:            modifiedLayers,
		Properties:        properties,
		RemovedLayers:     removedLayers,
		RemovedProperties: removedPropertyIDs,
	}, nil
}

func collectDatasetIDs(properties []*property.Property) []property.DatasetID {
	res := []property.DatasetID{}
	for _, p := range properties {
		res = append(res, p.Datasets()...)
	}
	return res
}
