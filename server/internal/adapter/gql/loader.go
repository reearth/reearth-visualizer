package gql

import (
	"context"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/interfaces"
)

const (
	dataLoaderWait     = 1 * time.Millisecond
	dataLoaderMaxBatch = 100
)

type Loaders struct {
	usecases  interfaces.Container
	Asset     *AssetLoader
	Dataset   *DatasetLoader
	Layer     *LayerLoader
	Plugin    *PluginLoader
	Policy    *PolicyLoader
	Project   *ProjectLoader
	Property  *PropertyLoader
	Scene     *SceneLoader
	Workspace *WorkspaceLoader
	User      *UserLoader
	Tag       *TagLoader
}

type DataLoaders struct {
	Asset          AssetDataLoader
	Dataset        DatasetDataLoader
	DatasetSchema  DatasetSchemaDataLoader
	LayerItem      LayerItemDataLoader
	LayerGroup     LayerGroupDataLoader
	Layer          LayerDataLoader
	Plugin         PluginDataLoader
	Policy         PolicyDataLoader
	Project        ProjectDataLoader
	Property       PropertyDataLoader
	PropertySchema PropertySchemaDataLoader
	Scene          SceneDataLoader
	Workspace      WorkspaceDataLoader
	User           UserDataLoader
	Tag            TagDataLoader
	TagItem        TagItemDataLoader
	TagGroup       TagGroupDataLoader
}

func NewLoaders(usecases *interfaces.Container) *Loaders {
	if usecases == nil {
		return nil
	}
	return &Loaders{
		usecases:  *usecases,
		Asset:     NewAssetLoader(usecases.Asset),
		Dataset:   NewDatasetLoader(usecases.Dataset),
		Layer:     NewLayerLoader(usecases.Layer),
		Plugin:    NewPluginLoader(usecases.Plugin),
		Policy:    NewPolicyLoader(usecases.Policy),
		Project:   NewProjectLoader(usecases.Project),
		Property:  NewPropertyLoader(usecases.Property),
		Scene:     NewSceneLoader(usecases.Scene),
		Workspace: NewWorkspaceLoader(usecases.Workspace),
		User:      NewUserLoader(usecases.User),
		Tag:       NewTagLoader(usecases.Tag),
	}
}

func (l Loaders) DataLoadersWith(ctx context.Context, enabled bool) *DataLoaders {
	if enabled {
		return l.DataLoaders(ctx)
	}
	return l.OrdinaryDataLoaders(ctx)
}

func (l Loaders) DataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
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
		Workspace:      l.Workspace.DataLoader(ctx),
		User:           l.User.DataLoader(ctx),
		Tag:            l.Tag.DataLoader(ctx),
		TagItem:        l.Tag.ItemDataLoader(ctx),
		TagGroup:       l.Tag.GroupDataLoader(ctx),
	}
}

func (l Loaders) OrdinaryDataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
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
		Workspace:      l.Workspace.OrdinaryDataLoader(ctx),
		User:           l.User.OrdinaryDataLoader(ctx),
		Tag:            l.Tag.OrdinaryDataLoader(ctx),
		TagItem:        l.Tag.ItemDataLoader(ctx),
		TagGroup:       l.Tag.GroupDataLoader(ctx),
	}
}

func single[T any](d []T, e []error) (t T, err error) {
	if len(e) > 0 {
		err = e[0]
		return
	}
	if len(d) > 0 {
		t = d[0]
		return
	}
	return
}
