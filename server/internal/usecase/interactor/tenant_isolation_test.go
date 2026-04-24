package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// SEC-01 regression tests: Fetch methods on the GraphQL node/nodes path must
// not return entities from workspaces/scenes the caller cannot read.
//
// The mongo repo positionally aligns results with input IDs (filling misses
// with nil); the memory repo used here does not, so the invariant checked is
// "unauthorized entities are excluded from the result set" regardless of
// ordering.

func hasAssetID(list []*asset.Asset, want id.AssetID) bool {
	for _, a := range list {
		if a != nil && a.ID() == want {
			return true
		}
	}
	return false
}

func hasProjectID(list []*project.Project, want id.ProjectID) bool {
	for _, p := range list {
		if p != nil && p.ID() == want {
			return true
		}
	}
	return false
}

func hasSceneID(list []*scene.Scene, want id.SceneID) bool {
	for _, s := range list {
		if s != nil && s.ID() == want {
			return true
		}
	}
	return false
}

func hasPropertyID(list []*property.Property, want id.PropertyID) bool {
	for _, p := range list {
		if p != nil && p.ID() == want {
			return true
		}
	}
	return false
}

func hasPluginID(list []*plugin.Plugin, want id.PluginID) bool {
	for _, p := range list {
		if p != nil && p.ID().Equal(want) {
			return true
		}
	}
	return false
}

func TestAsset_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownWs := accountsID.NewWorkspaceID()
	otherWs := accountsID.NewWorkspaceID()

	own := asset.New().NewID().Workspace(ownWs).URL("http://example.com/own").Size(1).MustBuild()
	other := asset.New().NewID().Workspace(otherWs).URL("http://example.com/other").Size(1).MustBuild()

	r := memory.NewAsset()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	i := &Asset{repos: &repo.Container{Asset: r}, gateways: &gateway.Container{}}
	op := &usecase.Operator{AcOperator: &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ownWs}}}

	res, err := i.Fetch(ctx, []id.AssetID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.True(t, hasAssetID(res, own.ID()), "own asset must be returned")
	assert.False(t, hasAssetID(res, other.ID()), "cross-tenant asset must not be returned")

	_, err = i.Fetch(ctx, []id.AssetID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestProject_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownWs := accountsID.NewWorkspaceID()
	otherWs := accountsID.NewWorkspaceID()

	own := project.New().NewID().Workspace(ownWs).MustBuild()
	other := project.New().NewID().Workspace(otherWs).MustBuild()

	r := memory.NewProject()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	importStatus := project.ProjectImportStatusNone
	ownMeta := project.NewProjectMetadata().NewID().Workspace(ownWs).Project(own.ID()).ImportStatus(&importStatus).MustBuild()
	otherMeta := project.NewProjectMetadata().NewID().Workspace(otherWs).Project(other.ID()).ImportStatus(&importStatus).MustBuild()
	mr := memory.NewProjectMetadata()
	require.NoError(t, mr.Save(ctx, ownMeta))
	require.NoError(t, mr.Save(ctx, otherMeta))

	i := &Project{
		projectRepo:         r,
		projectMetadataRepo: mr,
	}
	op := &usecase.Operator{AcOperator: &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ownWs}}}

	res, err := i.Fetch(ctx, []id.ProjectID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.True(t, hasProjectID(res, own.ID()), "own project must be returned")
	assert.False(t, hasProjectID(res, other.ID()), "cross-tenant project must not be returned")

	_, err = i.Fetch(ctx, []id.ProjectID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestScene_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownWs := accountsID.NewWorkspaceID()
	otherWs := accountsID.NewWorkspaceID()

	own := scene.New().NewID().Workspace(ownWs).Project(id.NewProjectID()).Property(id.NewPropertyID()).MustBuild()
	other := scene.New().NewID().Workspace(otherWs).Project(id.NewProjectID()).Property(id.NewPropertyID()).MustBuild()

	r := memory.NewScene()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	i := &Scene{sceneRepo: r}
	op := &usecase.Operator{
		AcOperator:     &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ownWs}},
		ReadableScenes: id.SceneIDList{own.ID()},
	}

	res, err := i.Fetch(ctx, []id.SceneID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.True(t, hasSceneID(res, own.ID()), "own scene must be returned")
	assert.False(t, hasSceneID(res, other.ID()), "cross-tenant scene must not be returned")

	_, err = i.Fetch(ctx, []id.SceneID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestProperty_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownScene := id.NewSceneID()
	otherScene := id.NewSceneID()

	schemaID, err := id.PropertySchemaIDFrom("reearth/default")
	require.NoError(t, err)

	own := property.New().NewID().Scene(ownScene).Schema(schemaID).MustBuild()
	other := property.New().NewID().Scene(otherScene).Schema(schemaID).MustBuild()

	r := memory.NewProperty()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))

	i := &Property{propertyRepo: r}
	op := &usecase.Operator{ReadableScenes: id.SceneIDList{ownScene}}

	res, err := i.Fetch(ctx, []id.PropertyID{own.ID(), other.ID()}, op)
	assert.NoError(t, err)
	assert.True(t, hasPropertyID(res, own.ID()), "own property must be returned")
	assert.False(t, hasPropertyID(res, other.ID()), "cross-scene property must not be returned")

	_, err = i.Fetch(ctx, []id.PropertyID{own.ID()}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}

func TestPlugin_Fetch_IDOR(t *testing.T) {
	ctx := context.Background()
	ownScene := id.NewSceneID()
	otherScene := id.NewSceneID()

	ownPluginID := id.MustPluginID(ownScene.String() + "~my-plugin~1.0.0")
	otherPluginID := id.MustPluginID(otherScene.String() + "~my-plugin~1.0.0")
	globalPluginID := id.MustPluginID("public-plugin~1.0.0")

	own := plugin.New().ID(ownPluginID).MustBuild()
	other := plugin.New().ID(otherPluginID).MustBuild()
	global := plugin.New().ID(globalPluginID).MustBuild()

	r := memory.NewPlugin()
	require.NoError(t, r.Save(ctx, own))
	require.NoError(t, r.Save(ctx, other))
	require.NoError(t, r.Save(ctx, global))

	i := &Plugin{pluginRepo: r}
	op := &usecase.Operator{ReadableScenes: id.SceneIDList{ownScene}}

	res, err := i.Fetch(ctx, []id.PluginID{ownPluginID, otherPluginID, globalPluginID}, op)
	assert.NoError(t, err)
	assert.True(t, hasPluginID(res, ownPluginID), "own scene-scoped plugin must be returned")
	assert.False(t, hasPluginID(res, otherPluginID), "cross-scene plugin must not be returned")
	assert.True(t, hasPluginID(res, globalPluginID), "global plugin (no scene) must always be returned")

	_, err = i.Fetch(ctx, []id.PluginID{globalPluginID}, nil)
	assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
}
