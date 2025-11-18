package gql

import (
	"context"
	"time"

	accounts_gql "github.com/reearth/reearth-accounts/server/internal/adapter/gql"
	accounts_interfaces "github.com/reearth/reearth-accounts/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
)

const (
	dataLoaderWait     = 1 * time.Millisecond
	dataLoaderMaxBatch = 100
)

type Loaders struct {
	usecases  interfaces.Container
	Asset     *AssetLoader
	Plugin    *PluginLoader
	Policy    *PolicyLoader
	Project   *ProjectLoader
	Property  *PropertyLoader
	Scene     *SceneLoader
	Story     *StoryLoader
	Workspace *accounts_gql.WorkspaceLoader
	User      *accounts_gql.UserLoader
}

type DataLoaders struct {
	Asset           AssetDataLoader
	Plugin          PluginDataLoader
	Policy          PolicyDataLoader
	Project         ProjectDataLoader
	ProjectMetadata ProjectMetadataLoader
	Property        PropertyDataLoader
	PropertySchema  PropertySchemaDataLoader
	Scene           SceneDataLoader
	Story           StoryDataLoader
	Workspace       WorkspaceDataLoader
	User            UserDataLoader
}

func NewLoaders(usecases *interfaces.Container) *Loaders {
	if usecases == nil {
		return nil
	}
	return &Loaders{
		usecases:  *usecases,
		Asset:     NewAssetLoader(usecases.Asset),
		Plugin:    NewPluginLoader(usecases.Plugin),
		Policy:    NewPolicyLoader(usecases.Policy),
		Project:   NewProjectLoader(usecases.Project),
		Property:  NewPropertyLoader(usecases.Property),
		Scene:     NewSceneLoader(usecases.Scene),
		Story:     NewStoryLoader(usecases.StoryTelling),
		Workspace: accounts_gql.NewWorkspaceLoader(accounts_interfaces.Workspace),
		User:      accounts_gql.NewUserLoader(accounts_interfaces.User),
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
		Plugin:         l.Plugin.DataLoader(ctx),
		Project:        l.Project.DataLoader(ctx),
		Property:       l.Property.DataLoader(ctx),
		PropertySchema: l.Property.SchemaDataLoader(ctx),
		Scene:          l.Scene.DataLoader(ctx),
		Workspace:      l.Workspace.DataLoader(ctx),
		User:           l.User.DataLoader(ctx),
	}
}

func (l Loaders) OrdinaryDataLoaders(ctx context.Context) *DataLoaders {
	return &DataLoaders{
		Asset:          l.Asset.OrdinaryDataLoader(ctx),
		Plugin:         l.Plugin.OrdinaryDataLoader(ctx),
		Project:        l.Project.OrdinaryDataLoader(ctx),
		Property:       l.Property.OrdinaryDataLoader(ctx),
		PropertySchema: l.Property.SchemaOrdinaryDataLoader(ctx),
		Scene:          l.Scene.OrdinaryDataLoader(ctx),
		Workspace:      l.Workspace.OrdinaryDataLoader(ctx),
		User:           l.User.OrdinaryDataLoader(ctx),
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
