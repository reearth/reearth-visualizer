package gql

import (
	"context"
	"time"

	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
)

const (
	dataLoaderWait     = 1 * time.Millisecond
	dataLoaderMaxBatch = 100
)

type Loaders struct {
	usecases interfaces.Container
	Asset    *AssetLoader
	Dataset  *DatasetLoader
	Layer    *LayerLoader
	Plugin   *PluginLoader
	Project  *ProjectLoader
	Property *PropertyLoader
	Scene    *SceneLoader
	Team     *TeamLoader
	User     *UserLoader
}

type DataLoaders struct {
	Asset          AssetDataLoader
	Dataset        DatasetDataLoader
	DatasetSchema  DatasetSchemaDataLoader
	LayerItem      LayerItemDataLoader
	LayerGroup     LayerGroupDataLoader
	Layer          LayerDataLoader
	Plugin         PluginDataLoader
	Project        ProjectDataLoader
	Property       PropertyDataLoader
	PropertySchema PropertySchemaDataLoader
	Scene          SceneDataLoader
	Team           TeamDataLoader
	User           UserDataLoader
}

func NewLoaders(usecases interfaces.Container) Loaders {
	return Loaders{
		usecases: usecases,
		Asset:    NewAssetLoader(usecases.Asset),
		Dataset:  NewDatasetLoader(usecases.Dataset),
		Layer:    NewLayerLoader(usecases.Layer),
		Plugin:   NewPluginLoader(usecases.Plugin),
		Project:  NewProjectLoader(usecases.Project),
		Property: NewPropertyLoader(usecases.Property),
		Scene:    NewSceneLoader(usecases.Scene),
		Team:     NewTeamLoader(usecases.Team),
		User:     NewUserLoader(usecases.User),
	}
}

func (l Loaders) DataLoadersWith(ctx context.Context, enabled bool) DataLoaders {
	if enabled {
		return l.DataLoaders(ctx)
	}
	return l.OrdinaryDataLoaders(ctx)
}

func (l Loaders) DataLoaders(ctx context.Context) DataLoaders {
	return DataLoaders{
		Asset:          l.Asset.DataLoader(ctx),
		Dataset:        l.Dataset.DataLoader(ctx),
		DatasetSchema:  l.Dataset.SchemaDataLoader(ctx),
		LayerItem:      l.Layer.ItemDataLoader(ctx),
		LayerGroup:     l.Layer.GroupDataLoader(ctx),
		Layer:          l.Layer.DataLoader(ctx),
		Plugin:         l.Plugin.DataLoader(ctx),
		Project:        l.Project.DataLoader(ctx),
		Property:       l.Property.DataLoader(ctx),
		PropertySchema: l.Property.SchemaDataLoader(ctx),
		Scene:          l.Scene.DataLoader(ctx),
		Team:           l.Team.DataLoader(ctx),
		User:           l.User.DataLoader(ctx),
	}
}

func (l Loaders) OrdinaryDataLoaders(ctx context.Context) DataLoaders {
	return DataLoaders{
		Asset:          l.Asset.OrdinaryDataLoader(ctx),
		Dataset:        l.Dataset.OrdinaryDataLoader(ctx),
		DatasetSchema:  l.Dataset.SchemaOrdinaryDataLoader(ctx),
		LayerItem:      l.Layer.ItemOrdinaryDataLoader(ctx),
		LayerGroup:     l.Layer.GroupOrdinaryDataLoader(ctx),
		Layer:          l.Layer.OrdinaryDataLoader(ctx),
		Plugin:         l.Plugin.OrdinaryDataLoader(ctx),
		Project:        l.Project.OrdinaryDataLoader(ctx),
		Property:       l.Property.OrdinaryDataLoader(ctx),
		PropertySchema: l.Property.SchemaOrdinaryDataLoader(ctx),
		Scene:          l.Scene.OrdinaryDataLoader(ctx),
		Team:           l.Team.OrdinaryDataLoader(ctx),
		User:           l.User.OrdinaryDataLoader(ctx),
	}
}

type dataLoadersKey struct{}

func DataLoadersFromContext(ctx context.Context) DataLoaders {
	return ctx.Value(dataLoadersKey{}).(DataLoaders)
}

func DataLoadersKey() interface{} {
	return dataLoadersKey{}
}
